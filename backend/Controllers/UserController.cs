using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Controllers
{
    [ApiController]
    [Route("user")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet()]
        public async Task<ActionResult<List<User>>> GetUsersAsync()
        {
            var users = await _userService.GetUsersAsync();
            return Ok(users);
        }
    }
}