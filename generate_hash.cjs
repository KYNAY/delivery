const bcrypt = require('bcryptjs');
bcrypt.hash('102030', 10).then(hash => console.log(hash));