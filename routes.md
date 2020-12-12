### User
| 请求方法  |  请求路径   | get参数  | post参数  |  备注 |
|  ----    |   ----      |   ----    | ----  |  ----  |
|post   |/user/login         | |username,password |登录 |
|post   |/user/add           | |username,password |添加用户 |
|get    |/user/:id            | _id| |查找单个用户 |
|put    |/user/:id            | _id,params| |编辑单个用户 |
|post   |/user               | | |查找所有用户 |

