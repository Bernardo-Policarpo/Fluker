// Banco de dados local
let users = JSON.parse(localStorage.getItem('users') || '[]');
let posts = JSON.parse(localStorage.getItem('posts') || '[]');
let stories = JSON.parse(localStorage.getItem('stories') || '[]');
let messages = JSON.parse(localStorage.getItem('messages') || '[]');
let currentUser = null;

// Elementos principais
const loginScreen = document.getElementById('login-screen');
const registerScreen = document.getElementById('register-screen');
const feedScreen = document.getElementById('feed-screen');
const profileScreen = document.getElementById('profile-screen');

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const btnLogin = document.getElementById('btn-login');
const btnShowRegister = document.getElementById('btn-show-register');

const regUsernameInput = document.getElementById('reg-username');
const regPasswordInput = document.getElementById('reg-password');
const btnRegister = document.getElementById('btn-register');
const btnShowLogin = document.getElementById('btn-show-login');

const userDisplay = document.getElementById('user-display');
const btnLogout = document.getElementById('btn-logout');

const postText = document.getElementById('post-text');
const postImage = document.getElementById('post-image');
const btnPost = document.getElementById('btn-post');
const feed = document.getElementById('feed');

const btnEditProfile = document.getElementById('btn-edit-profile');
const editUsernameInput = document.getElementById('edit-username');
const editPasswordInput = document.getElementById('edit-password');
const editAvatarInput = document.getElementById('edit-avatar');
const btnSaveProfile = document.getElementById('btn-save-profile');
const btnBackFeed = document.getElementById('btn-back-feed');

const toggleDark = document.getElementById('toggle-dark');
const storyUpload = document.getElementById('story-upload');
const storiesDiv = document.getElementById('stories');

const chatTarget = document.getElementById('chat-target');
const chatBox = document.getElementById('chat-box');
const chatMessage = document.getElementById('chat-message');
const btnSendChat = document.getElementById('btn-send-chat');

const notifications = document.getElementById('notifications');

// Funções utilitárias
function saveUsers() { localStorage.setItem('users', JSON.stringify(users)); }
function savePosts() { localStorage.setItem('posts', JSON.stringify(posts)); }
function saveStories() { localStorage.setItem('stories', JSON.stringify(stories)); }
function saveMessages() { localStorage.setItem('messages', JSON.stringify(messages)); }

function showScreen(screen) {
  loginScreen.classList.add('hidden');
  registerScreen.classList.add('hidden');
  feedScreen.classList.add('hidden');
  profileScreen.classList.add('hidden');
  screen.classList.remove('hidden');
}

function notify(msg) {
  const el = document.createElement('div');
  el.className = 'notification';
  el.textContent = msg;
  notifications.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// Dark Mode
if (localStorage.getItem('dark') === 'true') document.body.classList.add('dark');
toggleDark.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('dark', document.body.classList.contains('dark'));
    const audio = document.getElementById("peludao");
  audio.volume= 0.5; // volume do áudio
  audio.playbackRate = 1.5; // velocidade de reprodução
  audio.currentTime = 0; // volta ao início caso clique várias vezes
  audio.play();
  const button = document.getElementById('meuBotao');

const botao = document.getElementById('toggle-dark');
  if (document.body.classList.contains('dark')) {
    botao.textContent = 'Modo normal';
  } else {
    botao.textContent = 'Modo Fluker ';
  }


  
});

// Cadastro/Login
btnRegister.onclick = () => {
  const username = regUsernameInput.value.trim();
  const password = regPasswordInput.value.trim();
  if (!username || !password) return alert('Preencha todos os campos');
  if (users.find(u => u.username === username)) return alert('Usuário já existe');
  users.push({ username, password, avatar: '' });
  saveUsers();
  alert('Registrado!');
  showScreen(loginScreen);
};

btnLogin.onclick = () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return alert('Usuário ou senha incorretos');
  currentUser = user;
  userDisplay.textContent = currentUser.username;
  showScreen(feedScreen);
  renderPosts();
  renderStories();
};

btnShowRegister.onclick = () => showScreen(registerScreen);
btnShowLogin.onclick = () => showScreen(loginScreen);
btnLogout.onclick = () => { currentUser = null; showScreen(loginScreen); };

// Postagem
btnPost.onclick = () => {
  const text = postText.value.trim();
  if (!text && !postImage.files.length) return alert('Digite algo ou envie imagem');
  let imageUrl = '';
  if (postImage.files.length) imageUrl = URL.createObjectURL(postImage.files[0]);
  posts.push({ id: Date.now(), user: currentUser.username, text, imageUrl, comments: [], likes: [] });
  savePosts(); postText.value = ''; postImage.value = ''; renderPosts();
};

function renderPosts() {
  feed.innerHTML = '';
  posts.slice().reverse().forEach(post => {
    const el = document.createElement('div');
    el.className = 'post';
    const user = users.find(u => u.username === post.user);
    el.innerHTML = `
      <div class="post-header">
        ${user?.avatar ? `<img src="${user.avatar}" class="avatar" />` : ''}
        <strong>${post.user}</strong>
      </div>
      <p>${post.text}</p>
      ${post.imageUrl ? `<img src="${post.imageUrl}" />` : ''}
      <span class="like-button" data-id="${post.id}">❤️ Curtir (${post.likes.length})</span>
      <div class="comments">
        ${post.comments.map(c => `<div><b>${c.user}</b>: ${c.text} <span class="reply">${c.replyTo ? `respondeu ${c.replyTo}` : ''}</span></div>`).join('')}
      </div>
      <input type="text" class="comment-input" data-id="${post.id}" placeholder="Comentar..." />
    `;
    feed.appendChild(el);
  });

  document.querySelectorAll('.like-button').forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      const post = posts.find(p => p.id === id);
      if (!post.likes.includes(currentUser.username)) {
        post.likes.push(currentUser.username);
        savePosts();
        renderPosts();
        notify(`${currentUser.username} curtiu um post de ${post.user}`);
      }
    };
  });

  document.querySelectorAll('.comment-input').forEach(input => {
    input.onkeypress = e => {
      if (e.key === 'Enter') {
        const id = Number(input.dataset.id);
        const text = input.value.trim();
        if (!text) return;
        const post = posts.find(p => p.id === id);
        post.comments.push({ user: currentUser.username, text });
        savePosts(); input.value = ''; renderPosts();
      }
    };
  });
}

// Profile
btnEditProfile.onclick = () => {
  editUsernameInput.value = currentUser.username;
  editPasswordInput.value = currentUser.password;
  showScreen(profileScreen);
};
btnSaveProfile.onclick = () => {
  currentUser.username = editUsernameInput.value.trim();
  currentUser.password = editPasswordInput.value.trim();
  if (editAvatarInput.files[0])
    currentUser.avatar = URL.createObjectURL(editAvatarInput.files[0]);
  saveUsers(); alert('Perfil atualizado');
  showScreen(feedScreen);
  renderPosts();
};
btnBackFeed.onclick = () => showScreen(feedScreen);

// Stories
storyUpload.onchange = () => {
  if (!storyUpload.files[0]) return;
  const imageUrl = URL.createObjectURL(storyUpload.files[0]);
  stories.push({ user: currentUser.username, image: imageUrl, time: Date.now() });
  saveStories();
  renderStories();
};

function renderStories() {
  storiesDiv.innerHTML = '';
  const recent = stories.filter(s => Date.now() - s.time < 86400000);
  recent.forEach(s => {
    const el = document.createElement('img');
    el.src = s.image;
    el.title = s.user;
    storiesDiv.appendChild(el);
  });
}

// Chat direto
btnSendChat.onclick = () => {
  const target = chatTarget.value.trim();
  const msg = chatMessage.value.trim();
  if (!target || !msg) return;
  if (!users.find(u => u.username === target)) return alert('Conta não encontrada');

  const convo = messages.find(c => c.users.includes(currentUser.username) && c.users.includes(target));
  if (convo) {
    convo.chat.push({ from: currentUser.username, text: msg });
  } else {
    messages.push({ users: [currentUser.username, target], chat: [{ from: currentUser.username, text: msg }] });
  }
  saveMessages();
  notify(`${currentUser.username} enviou uma mensagem para ${target}`);
  renderChat(target);
  chatMessage.value = '';
};

chatTarget.onblur = () => {
  const target = chatTarget.value.trim();
  if (!users.find(u => u.username === target)) {
    chatBox.innerHTML = '<i>Conta não encontrada</i>';
  } else {
    renderChat(target);
  }
};

function renderChat(target) {
  chatBox.innerHTML = '';
  const convo = messages.find(c => c.users.includes(currentUser.username) && c.users.includes(target));
  if (!convo) return;
  convo.chat.forEach(m => {
    const el = document.createElement('div');
    el.textContent = `${m.from}: ${m.text}`;
    chatBox.appendChild(el);
  });
}

// Inicializar
showScreen(loginScreen);
