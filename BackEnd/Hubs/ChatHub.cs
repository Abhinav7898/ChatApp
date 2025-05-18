using ChatApp.DataService;
using ChatApp.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace ChatApp.Hubs
{
    public class ChatHub : Hub
    {
        private readonly SharedDb _shared;
        private readonly ILogger<ChatHub> _logger;

        public ChatHub(SharedDb shared, ILogger<ChatHub> logger)
        {
            _shared = shared;
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
            if (_shared.connections.TryGetValue(Context.ConnectionId, out UserConnection conn))
            {
                await LeaveChat(conn.UserName);
                _shared.connections.TryRemove(Context.ConnectionId, out _);
            }
            if (exception != null)
            {
                _logger.LogError(exception, "Client disconnected with error");
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinChat(UserConnection conn)
        {
            _logger.LogInformation("User {UserName} joining chat", conn.UserName);
            await Clients.All.SendAsync("ReceiveMessage", conn.UserName, "has joined");
        }

        public async Task JoinSpecificChatRoom(UserConnection conn)
        {
            _logger.LogInformation("User {UserName} joining room {ChatRoom}", conn.UserName, conn.ChatRoom);
            await Groups.AddToGroupAsync(Context.ConnectionId, conn.ChatRoom);

            _shared.connections[Context.ConnectionId] = conn;
            await Clients.Group(conn.ChatRoom).SendAsync("JoinSpecificChatRoom", conn.UserName, "has joined");
        }

        public async Task LeaveChat(string userName)
        {
            _logger.LogInformation("User {UserName} leaving chat", userName);
            if (_shared.connections.TryGetValue(Context.ConnectionId, out UserConnection conn))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, conn.ChatRoom);
                await Clients.Group(conn.ChatRoom).SendAsync("UserLeft", userName, "has left the chat");
                _shared.connections.TryRemove(Context.ConnectionId, out _);
            }
        }

        public async Task SendMessage(string user, string message)
        {
            _logger.LogInformation("Received message from {User} in connection {ConnectionId}", user, Context.ConnectionId);
            
            if (_shared.connections.TryGetValue(Context.ConnectionId, out UserConnection conn))
            {
                _logger.LogInformation("Sending message to room {ChatRoom}", conn.ChatRoom);
                await Clients.Group(conn.ChatRoom).SendAsync("ReceiveSpecificMessage", user, message);
            }
            else
            {
                _logger.LogWarning("Connection {ConnectionId} not found in shared connections", Context.ConnectionId);
            }
        }
    }
}
