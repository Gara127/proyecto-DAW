namespace Services.Interfaces
{
    public interface IUserService
    {
        Task<List<User>> GetUsersAsync();
    }
}
