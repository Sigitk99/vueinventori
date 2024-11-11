export { fakeBackend };

// array in local storage for registered users
const usersKey = 'vue-3-pinia-registration-login-example-users';
let users = JSON.parse(localStorage.getItem(usersKey)) || [];

// array in local storage for inventory items
const inventoryKey = 'vue-3-pinia-inventory-items';
let inventory = JSON.parse(localStorage.getItem(inventoryKey)) || [];

function fakeBackend() {
    let realFetch = window.fetch;
    window.fetch = function (url, opts) {
        return new Promise((resolve, reject) => {
            // wrap in timeout to simulate server api call
            setTimeout(handleRoute, 500);

            function handleRoute() {
                switch (true) {
                    case url.endsWith('/users/authenticate') && opts.method === 'POST':
                        return authenticate();
                    case url.endsWith('/users/register') && opts.method === 'POST':
                        return register();
                    case url.endsWith('/users') && opts.method === 'GET':
                        return getUsers();
                    case url.match(/\/users\/\d+$/) && opts.method === 'GET':
                        return getUserById();
                    case url.match(/\/users\/\d+$/) && opts.method === 'PUT':
                        return updateUser();
                    case url.match(/\/users\/\d+$/) && opts.method === 'DELETE':
                        return deleteUser();
                    case url.endsWith('/inventory') && opts.method === 'GET':
                        return getInventory();
                    case url.endsWith('/inventory') && opts.method === 'POST':
                        return createInventoryItem();
                    case url.match(/\/inventory\/\d+$/) && opts.method === 'GET':
                        return getInventoryById();
                    case url.match(/\/inventory\/\d+$/) && opts.method === 'PUT':
                        return updateInventoryItem();
                    case url.match(/\/inventory\/\d+$/) && opts.method === 'DELETE':
                        return deleteInventoryItem();
                    default:
                        // pass through any requests not handled above
                        return realFetch(url, opts)
                            .then(response => resolve(response))
                            .catch(error => reject(error));
                }
            }

            // route functions

            function authenticate() {
                const { username, password } = body();
                const user = users.find(x => x.username === username && x.password === password);

                if (!user) return error('Username or password is incorrect');

                return ok({
                    ...basicDetails(user),
                    token: 'fake-jwt-token'
                });
            }

            function register() {
                const user = body();

                if (users.find(x => x.username === user.username)) {
                    return error('Username "' + user.username + '" is already taken')
                }

                user.id = users.length ? Math.max(...users.map(x => x.id)) + 1 : 1;
                users.push(user);
                localStorage.setItem(usersKey, JSON.stringify(users));
                return ok();
            }

            function getUsers() {
                if (!isAuthenticated()) return unauthorized();
                return ok(users.map(x => basicDetails(x)));
            }

            function getUserById() {
                if (!isAuthenticated()) return unauthorized();

                const user = users.find(x => x.id === idFromUrl());
                return ok(basicDetails(user));
            }

            function updateUser() {
                if (!isAuthenticated()) return unauthorized();

                let params = body();
                let user = users.find(x => x.id === idFromUrl());

                if (!params.password) {
                    delete params.password;
                }

                if (params.username !== user.username && users.find(x => x.username === params.username)) {
                    return error('Username "' + params.username + '" is already taken')
                }

                Object.assign(user, params);
                localStorage.setItem(usersKey, JSON.stringify(users));

                return ok();
            }

            function deleteUser() {
                if (!isAuthenticated()) return unauthorized();

                users = users.filter(x => x.id !== idFromUrl());
                localStorage.setItem(usersKey, JSON.stringify(users));
                return ok();
            }

            function getInventory() {
                if (!isAuthenticated()) return unauthorized();
                return ok(inventory);
            }

            function getInventoryById() {
                if (!isAuthenticated()) return unauthorized();

                const item = inventory.find(x => x.id === idFromUrl());
                return ok(item);
            }

            function createInventoryItem() {
                if (!isAuthenticated()) return unauthorized();

                const item = body();
                item.id = inventory.length ? Math.max(...inventory.map(x => x.id)) + 1 : 1;
                inventory.push(item);
                localStorage.setItem(inventoryKey, JSON.stringify(inventory));
                return ok();
            }

            function updateInventoryItem() {
                if (!isAuthenticated()) return unauthorized();

                const id = idFromUrl();
                const params = body();
                const item = inventory.find(x => x.id === id);

                Object.assign(item, params);
                localStorage.setItem(inventoryKey, JSON.stringify(inventory));
                return ok();
            }

            function deleteInventoryItem() {
                if (!isAuthenticated()) return unauthorized();

                inventory = inventory.filter(x => x.id !== idFromUrl());
                localStorage.setItem(inventoryKey, JSON.stringify(inventory));
                return ok();
            }

            // helper functions

            function ok(body) {
                resolve({ ok: true, ...headers(), json: () => Promise.resolve(body) })
            }

            function unauthorized() {
                resolve({ status: 401, ...headers(), json: () => Promise.resolve({ message: 'Unauthorized' }) })
            }

            function error(message) {
                resolve({ status: 400, ...headers(), json: () => Promise.resolve({ message }) })
            }

            function basicDetails(user) {
                const { id, username, firstName, lastName } = user;
                return { id, username, firstName, lastName };
            }

            function isAuthenticated() {
                return opts.headers['Authorization'] === 'Bearer fake-jwt-token';
            }

            function body() {
                return opts.body && JSON.parse(opts.body);
            }

            function idFromUrl() {
                const urlParts = url.split('/');
                return parseInt(urlParts[urlParts.length - 1]);
            }

            function headers() {
                return {
                    headers: {
                        get(key) {
                            return ['application/json'];
                        }
                    }
                }
            }
        });
    }
}