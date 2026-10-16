using Microsoft.EntityFrameworkCore;
using RestaurantAPI.Data;
using RestaurantAPI.Dtos.Delivery;
using RestaurantAPI.Dtos.Order;
using RestaurantAPI.Dtos.OrderItem;
using RestaurantAPI.Enums;
using RestaurantAPI.Models;

namespace RestaurantAPI.Services;

public class OrderService(AppDbContext context, IPayUService payUService) : IOrderService
{
    public async Task<IEnumerable<OrderResponseDto>> GetClientOrdersAsync(int clientId)
        => await context.Orders
            .IgnoreQueryFilters()
            .Where(o => o.ClientId == clientId)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => new OrderResponseDto(
                o.OrderId,
                o.OrderNumber,
                o.TableNumber,
                o.Status,
                o.TotalPrice,
                o.OrderDate,
                o.EstimatedPreparationTime,
                o.Items.Select(i => new OrderItemResponseDto(
                        i.DishId,
                        i.Dish!.Name,
                        i.Quantity,
                        i.UnitPrice
                    )).ToList(),
                o.IsPaid
            )).ToListAsync();

    public async Task<OrderResponseDto?> GetOrderByIdForClientAsync(int orderId, int clientId)
    {
        var result = await context.Orders
            .IgnoreQueryFilters()
            .Where(o => o.OrderId == orderId && o.ClientId == clientId)
            .Select(o => new OrderResponseDto(
                o.OrderId,
                o.OrderNumber,
                o.TableNumber,
                o.Status,
                o.TotalPrice,
                o.OrderDate,
                o.EstimatedPreparationTime,
                o.Items.Select(i => new OrderItemResponseDto(
                    i.DishId,
                    i.Dish!.Name,
                    i.Quantity,
                    i.UnitPrice
                )).ToList(),
                o.IsPaid
            )).FirstOrDefaultAsync();
        return result;
    }
    

    public async Task<CreateOrderResponseDto> CreateOrderAsync(int? clientId, CreateOrderDto dto)
    {
        if (dto.OrderType == OrderType.NaMiejscu && dto.TableNumber == null)
        {
            throw new Exception("Dla zamówień na miejscu wymagane jest podanie numeru stolika.");
        }
        
        var dishIds = dto.OrderItems.Select(o => o.DishId).Distinct().ToList();
        
        var dishesFromDb = await context.Dishes
            .Where(d => dishIds.Contains(d.DishId))
            .ToDictionaryAsync(d => d.DishId,  d => d);
        
        decimal totalPrice = 0;
        var orderItems = new List<OrderItem>();
        
        foreach (var itemDto in dto.OrderItems)
        {
            if (!dishesFromDb.TryGetValue(itemDto.DishId, out var dbDish))
            {
                throw new Exception($"Danie o ID {itemDto.DishId} nie istnieje.");
            }
            
            totalPrice += (dbDish.Price * itemDto.Quantity);
            
            orderItems.Add(new OrderItem
            {
                DishId = dbDish.DishId,
                UnitPrice = dbDish.Price,
                Quantity = itemDto.Quantity,
                Status = OrderItemStatus.Oczekujace
            });
        }

        var newOrder = new Order
        {
            OrderNumber = await GenerateOrderNumberAsync(dto.OrderType),
            OrderType = dto.OrderType,
            TableNumber = dto.TableNumber,
            Status = OrderStatus.Nowe,
            TotalPrice = totalPrice,
            OrderDate = DateTime.UtcNow,
            CustomerNotes = dto.CustomerNotes,
            Items = orderItems,
            ClientId = clientId
        };

        if (dto.OrderType == OrderType.Dostawa)
        {
            if (dto.AddressId == null)
            {
                throw new Exception("Dla zamowień z dostawą wymagane jest podanie adresu.");
            }

            newOrder.Delivery = new Delivery
            {
                AddressId = dto.AddressId.Value,
                DeliveryStatus = DeliveryStatus.OczekujeNaKuriera
            };
        }

        context.Orders.Add(newOrder);
        await context.SaveChangesAsync();

        string paymentUrl = await payUService.CreatePaymentAsync(newOrder);
        
        var itemsDto = newOrder.Items.Select(i => new OrderItemResponseDto(
            i.DishId,
            dishesFromDb[i.DishId].Name,
            i.Quantity,
            i.UnitPrice
        )).ToList();

        return new CreateOrderResponseDto(
            newOrder.OrderId,
            newOrder.OrderNumber,
            newOrder.TableNumber,
            newOrder.Status,
            newOrder.TotalPrice,
            newOrder.OrderDate,
            newOrder.EstimatedPreparationTime,
            itemsDto,
            paymentUrl
        );

    }

    public async Task<bool> CancelOrderAsync(int orderId, int clientId)
    {
        var order =  await context.Orders
            .FirstOrDefaultAsync(o => o.OrderId == orderId && o.ClientId == clientId);
        if (order is null || order.Status != OrderStatus.Nowe) return false;

        order.Status = OrderStatus.Anulowane;
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<FullOrderResponseDto>> GetAllActiveOrdersAsync() => await  context.Orders
        .IgnoreQueryFilters()
        .Where(o => o.Status != OrderStatus.Zakonczone && o.Status != OrderStatus.Anulowane)
        .Select(o => new FullOrderResponseDto(
            o.OrderId,
            o.OrderNumber,
            o.OrderType,
            o.TableNumber,
            o.Delivery == null ? null : new DeliveryInfoResponseDto(
                o.Delivery.DeliveryId,
                o.Delivery.DeliveryStatus,
                $"{o.Delivery.Address.City}, {o.Delivery.Address.Street}",
                o.Delivery.Employee != null ? o.Delivery.Employee.Name : null
                ),
            o.Status,
            o.TotalPrice,
            o.OrderDate,
            o.EstimatedPreparationTime,
            o.CustomerNotes,
            o.Items.Select(i => new FullOrderItemResponseDto(
                i.OrderItemId,
                i.Quantity,
                i.UnitPrice,
                i.Status,
                i.OrderId,
                i.DishId,
                i.Dish!.Name,
                i.Employee != null ? i.Employee.Name : null
            )).ToList(),
            o.ClientId,
            o.Client != null ? o.Client.Name : null,
            o.Client != null ? o.Client.PhoneNumber : null,
            o.EmployeeId,
            o.Employee != null ? o.Employee.Name : null,
            o.IsPaid
        )).ToListAsync();
    

    public async Task<bool> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusDto newStatus)
    {
        var order = await  context.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId);
        if (order is null) return false;
        
        order.Status = newStatus.OrderStatus;
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AssignEmployeeToOrderAsync(int orderId, int employeeId)
    {
        var order = await context.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId);
        if (order is null) return false;

        var employeeToAssign = await context.Employees.FirstOrDefaultAsync(e => e.EmployeeId == employeeId);
        if(employeeToAssign is null) return false;
        
        order.Employee = employeeToAssign;
        order.EmployeeId = employeeToAssign.EmployeeId;
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateOrderItemStatusAsync(int orderId, int itemId,int employeeId,UpdateOrderItemStatusDto dto)
    {
        var item = await context.OrderItems
            .Include(i => i.Order)
            .FirstOrDefaultAsync(i => i.OrderItemId == itemId &&  i.OrderId == orderId);
        if (item is null) return false;
        
        item.Status = dto.OrderItemStatus;
        item.EmployeeId = employeeId;

        if (dto.OrderItemStatus == OrderItemStatus.WPrzygotowaniu && item.Order.Status == OrderStatus.Nowe)
        {
            item.Order.Status = OrderStatus.WPrzygotowaniu;
        }

        if (dto.OrderItemStatus == OrderItemStatus.Gotowe)
        {
            var hasUnfinishedItems = await context.OrderItems
                .AnyAsync(i => i.OrderId == orderId
                && i.OrderItemId != itemId
                && i.Status != OrderItemStatus.Gotowe
                && i.Status != OrderItemStatus.Anulowane);

            if (!hasUnfinishedItems)
            {
                item.Order.Status = OrderStatus.Gotowe;
            }
        }
        
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateEstimatedPreparationTimeAsync(int orderId, int estimatedTimeInMinutes)
    {
        var order = await context.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId);
        if (order is null) return false;
        
        order.EstimatedPreparationTime = DateTime.UtcNow.AddMinutes(estimatedTimeInMinutes);
        await context.SaveChangesAsync();
        return true;
    }

    private async Task<string> GenerateOrderNumberAsync(OrderType orderType)
    {
        var today = DateTime.UtcNow.Date;
        var tommorow = today.AddDays(1);
        
        
        var todaysOrderCounter = await context.Orders
            .Where(o => o.OrderDate >= today && o.OrderDate <  tommorow)
            .CountAsync();

        var nextNumber = todaysOrderCounter + 1;
        var datePart = today.ToString("yyyyMMdd");
        var prefix = orderType == OrderType.Dostawa ? "DLV" : "LOC";

        return $"{prefix}-{datePart}-{nextNumber}";
    }
}