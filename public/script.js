document.addEventListener('DOMContentLoaded', () => {
  // Handle user registration
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      alert('User registered successfully');
    } else {
      alert('Failed to register user');
    }
  });

  // Handle user login
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      alert('Login successful');
    } else {
      alert('Login failed');
    }
  });

  // Handle post creation
  document.getElementById('post-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitButton = document.getElementById('submit-button');
    if (submitButton.disabled) return; // Prevent multiple submissions

    submitButton.disabled = true; // Disable the submit button to prevent multiple submissions
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    const response = await fetch('http://localhost:3000/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ title, content })
    });

    submitButton.disabled = false; // Re-enable the submit button after the request

    if (response.ok) {
      alert('Post created successfully');
      document.getElementById('post-form').reset(); // Reset the form after submission
      loadPosts(); // Reload posts to show the new post
    } else {
      alert('Failed to create post');
    }
  });

  // Handle search
  document.getElementById('search-button').addEventListener('click', async () => {
    const query = document.getElementById('search-query').value;
    const response = await fetch(`http://localhost:3000/search?query=${encodeURIComponent(query)}`);
    const posts = await response.json();
    displayPosts(posts);
  });

  // Function to display posts
  function displayPosts(posts) {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = posts.map(post => `
      <div>
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <small>Created at: ${new Date(post.createdAt).toLocaleString()}</small>
        <button class="edit-button" onclick="editPost('${post._id}', '${post.title}', '${post.content}')">Edit</button>
        <button class="delete-button" onclick="deletePost('${post._id}')">Delete</button>
        <div id="comments-${post._id}"></div>
        <form onsubmit="addComment(event, '${post._id}')">
          <textarea placeholder="Add a comment" required></textarea>
          <button type="submit">Comment</button>
        </form>
      </div>
    `).join('');

    posts.forEach(post => {
      loadComments(post._id);
    });
  }

  // Handle post editing
  async function editPost(id, title, content) {
    document.getElementById('title').value = title;
    document.getElementById('content').value = content;

    const form = document.getElementById('post-form');
    form.removeEventListener('submit', handlePostSubmit);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const updatedTitle = document.getElementById('title').value;
      const updatedContent = document.getElementById('content').value;

      const response = await fetch(`http://localhost:3000/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: updatedTitle, content: updatedContent })
      });

      if (response.ok) {
        alert('Post updated successfully');
        loadPosts();
      } else {
        alert('Failed to update post');
      }
    });
  }

  // Handle post deletion
  async function deletePost(id) {
    const response = await fetch(`http://localhost:3000/posts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      alert('Post deleted successfully');
      loadPosts();
    } else {
      alert('Failed to delete post');
    }
  }

  // Handle comment addition
  async function addComment(event, postId) {
    event.preventDefault();
    const content = event.target.querySelector('textarea').value;

    const response = await fetch(`http://localhost:3000/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ content })
    });

    if (response.ok) {
      alert('Comment added successfully');
      loadComments(postId);
    } else {
      alert('Failed to add comment');
    }
  }

  // Load comments for a post
  async function loadComments(postId) {
    const response = await fetch(`http://localhost:3000/posts/${postId}/comments`);
    const comments = await response.json();
    const commentsContainer = document.getElementById(`comments-${postId}`);
    commentsContainer.innerHTML = comments.map(comment => `
      <div>
        <p>${comment.content}</p>
        <small>Created at: ${new Date(comment.createdAt).toLocaleString()}</small>
      </div>
    `).join('');
  }

  // Initial load of posts
  async function loadPosts() {
    const response = await fetch('http://localhost:3000/posts');
    const posts = await response.json();
    displayPosts(posts);
  }

  // Attach the initial loadPosts function to the form
  function handlePostSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    fetch('http://localhost:3000/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ title, content })
    }).then(() => {
      alert('Post created successfully');
      loadPosts();
    }).catch(() => {
      alert('Failed to create post');
    });
  }

  document.getElementById('post-form').addEventListener('submit', handlePostSubmit);

  // Load posts on page load
  loadPosts();
});
