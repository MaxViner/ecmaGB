const express = require('express');
const app = express();
const port = 3000;
let users = [];

app.get('/', async (req, res) => {
    try {
      const fetch = await import('node-fetch');
      fetch.default('https://jsonplaceholder.typicode.com/users')
        .then(response => response.json())
        .then(fetchedUsers => {
          users = fetchedUsers;
          const userList = users.map(user => `<li data-id="${user.id}">${user.name}
          <button onclick="deleteUser(${user.id})">Delete</button></li>`).join('');
          const html = `
            <h1>User List</h1>
            <ul id="userList">${userList}</ul>
            <a href="/dog">Go to Dog Images</a>
            <script>
              async function deleteUser(userId) {
                try {
                  const response = await fetch('/delete/' + userId, { method: 'DELETE' });
                  if (response.ok) {
                    const listItem = document.querySelector(\`li[data-id="\${userId}"]\`);
                    listItem.remove();
                  } else {
                    console.error('Failed to delete user');
                  }
                } catch (error) {
                  console.error('Error deleting user:', error);
                }
              }
            </script>
          `;
          res.send(html);
        })
        .catch(error => {
          console.error('Error fetching user list:', error);
          res.status(500).send('Internal Server Error');
        });
    } catch (error) {
      console.error('Error importing node-fetch module:', error);
      res.status(500).send('Internal Server Error');
    }
  });

app.get('/dog', async (req, res) => {
  try {
    const fetch = await import('node-fetch');
    const response = await fetch.default('https://dog.ceo/api/breeds/image/random/10');
    const data = await response.json();
    const dogImages = data.message;

    res.write('<h1>Dog Images</h1>');
    res.write('<ul>');

    const interval = setInterval(() => {
      if (dogImages.length === 0) {
        clearInterval(interval);
        res.write('</ul>');
        res.write('<a href="/">Go back to User List</a>');
        res.end();
        return;
      }

      const imageUrl = dogImages.shift();
      res.write(`<li><img src="${imageUrl}" alt="Dog Image"></li>`);
    }, 3000);
  } catch (error) {
    console.error('Error retrieving dog images:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.delete('/delete/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    users = users.filter(user => user.id !== userId);
    res.status(200).json({ message: 'User deleted successfully', users });
  });
  
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
