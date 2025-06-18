// app.js (Modificado para interagir com o backend)

// Banco de dados local (estas linhas serão removidas ou adaptadas)
// let users = JSON.parse(localStorage.getItem('users') || '[]'); // REMOVER
// ...

let currentUser = null; // Agora armazenará o ID e username do usuário logado

const API_BASE_URL = 'http://localhost:3000/api'; // URL do seu backend Node.js

// ... (Elementos principais e Funções utilitárias como notify, showScreen e dark mode permanecem)

// Funções utilitárias (estas serão removidas ou adaptadas)
// function saveUsers() { localStorage.setItem('users', JSON.stringify(users)); } // REMOVER
// function savePosts() { localStorage.setItem('posts', JSON.stringify(posts)); } // REMOVER
// function saveStories() { localStorage.setItem('stories', JSON.stringify(stories)); } // REMOVER
// function saveMessages() { localStorage.setItem('messages', JSON.stringify(messages)); } // REMOVER

// Cadastro
btnRegister.onclick = async () => {
  const username = regUsernameInput.value.trim();
  const password = regPasswordInput.value.trim();
  if (!username || !password) return notify('Preencha todos os campos');

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (response.ok) {
      notify('Registrado com sucesso!');
      showScreen(loginScreen);
      regUsernameInput.value = '';
      regPasswordInput.value = '';
    } else {
      notify(`Erro: ${data.error}`);
    }
  } catch (error) {
    console.error('Erro ao registrar:', error);
    notify('Erro ao conectar com o servidor.');
  }
};

// Login
btnLogin.onclick = async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (response.ok) {
      currentUser = data.user; // Armazena id, username e avatar
      userDisplay.textContent = currentUser.username;
      showScreen(feedScreen);
      renderPosts(); // Chama a função que buscará os posts do backend
      renderStories(); // Chama a função que buscará as stories do backend
    } else {
      notify(`Erro: ${data.error}`);
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    notify('Erro ao conectar com o servidor.');
  }
};

btnLogout.onclick = () => {
  currentUser = null;
  showScreen(loginScreen);
  // Limpar campos de login/registro se necessário
  usernameInput.value = '';
  passwordInput.value = '';
};

// Postagem
btnPost.onclick = async () => {
  if (!currentUser) {
    notify('Você precisa estar logado para postar.');
    return;
  }
  const text = postText.value.trim();
  let imageUrl = '';

  if (postImage.files.length) {
    // Para uploads de imagem real, você precisaria de um serviço de upload (como Cloudinary)
    // ou enviar a imagem para o backend e o backend salvar no disco/serviço de armazenamento.
    // Por simplicidade, aqui vamos simular com URL.createObjectURL para testes visuais.
    // EM PRODUÇÃO, VOCÊ NUNCA ENVIARIA URL.createObjectURL PARA UM BACKEND.
    // Você enviaria o arquivo binário e o backend processaria.
    imageUrl = URL.createObjectURL(postImage.files[0]);
    // Para um backend real, você enviaria o arquivo:
    // const formData = new FormData();
    // formData.append('image', postImage.files[0]);
    // formData.append('text', text);
    // formData.append('userId', currentUser.id);
    // await fetch(`${API_BASE_URL}/posts/upload`, { method: 'POST', body: formData });
  }

  if (!text && !imageUrl) {
    notify('Digite algo ou envie uma imagem.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, text, imageUrl })
    });
    const data = await response.json();
    if (response.ok) {
      notify('Post publicado com sucesso!');
      postText.value = '';
      postImage.value = '';
      renderPosts();
    } else {
      notify(`Erro ao postar: ${data.error}`);
    }
  } catch (error) {
    console.error('Erro ao postar:', error);
    notify('Erro ao conectar com o servidor para postar.');
  }
};

async function renderPosts() {
  feed.innerHTML = '';
  try {
    const response = await fetch(`${API_BASE_URL}/posts`);
    const posts = await response.json();

    posts.forEach(post => { // `post` já virá com likes, comments e user
      const el = document.createElement('div');
      el.className = 'post';

      // Filtrar e formatar comentários para exibir username
      const formattedComments = post.comments.map(c => {
        // Isso requer uma consulta adicional para obter o username do comment.userId
        // No backend, a query de posts já faz isso.
        // Aqui, para simplificar, se o backend mandar username, usaremos.
        // Se mandar userId, você precisaria de uma lista de usuários no frontend
        // ou outra requisição para buscar o username.
        // O backend já está enviando 'userId:text', então precisamos mapear isso.
        // No SQL do backend, o GROUP_CONCAT para comentários está como user_id || ':' || text.
        // Vamos assumir que `post.comments` vem do backend como um array de strings 'userId:text'.
        // O ideal é que o backend já retorne um array de objetos { user: 'username', text: '...' }
        // Para este exemplo, vamos simplificar a exibição.
        // (Ajuste na SQL do backend para retornar o username do comentador é o ideal)
        const commentUser = users.find(u => u.id === c.userId)?.username || 'Usuário Desconhecido';
        return `<div><b>${commentUser}</b>: ${c.text}</div>`;
      }).join('');


      el.innerHTML = `
        <div class="post-header">
          ${post.userAvatar ? `<img src="${post.userAvatar}" class="avatar" />` : ''}
          <strong>${post.user}</strong>
        </div>
        <p>${post.text}</p>
        ${post.imageUrl ? `<img src="${post.imageUrl}" />` : ''}
        <span class="like-button ${post.likes.includes(currentUser?.id) ? 'liked' : ''}" data-id="${post.id}">❤️ Curtir (${post.likes.length})</span>
        <div class="comments">
          ${formattedComments}
        </div>
        <input type="text" class="comment-input" data-id="${post.id}" placeholder="Comentar..." />
      `;
      feed.appendChild(el);
    });

    document.querySelectorAll('.like-button').forEach(btn => {
      btn.onclick = async () => {
        if (!currentUser) { notify('Faça login para curtir.'); return; }
        const id = Number(btn.dataset.id);
        try {
          const response = await fetch(`${API_BASE_URL}/posts/${id}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id })
          });
          const data = await response.json();
          if (response.ok) {
            notify('Post curtido!');
            renderPosts(); // Recarrega os posts para atualizar as curtidas
          } else {
            notify(`Erro ao curtir: ${data.error}`);
          }
        } catch (error) {
          console.error('Erro ao curtir post:', error);
          notify('Erro ao conectar com o servidor para curtir.');
        }
      };
    });

    document.querySelectorAll('.comment-input').forEach(input => {
      input.onkeypress = async e => {
        if (e.key === 'Enter') {
          if (!currentUser) { notify('Faça login para comentar.'); return; }
          const id = Number(input.dataset.id);
          const text = input.value.trim();
          if (!text) return;
          try {
            const response = await fetch(`${API_BASE_URL}/posts/${id}/comment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: currentUser.id, text })
            });
            const data = await response.json();
            if (response.ok) {
              notify('Comentário adicionado!');
              input.value = '';
              renderPosts(); // Recarrega os posts para atualizar os comentários
            } else {
              notify(`Erro ao comentar: ${data.error}`);
            }
          } catch (error) {
            console.error('Erro ao comentar:', error);
            notify('Erro ao conectar com o servidor para comentar.');
          }
        }
      };
    });

  } catch (error) {
    console.error('Erro ao carregar posts:', error);
    notify('Erro ao carregar posts do servidor.');
  }
}

// Profile
btnEditProfile.onclick = () => {
  if (currentUser) {
    editUsernameInput.value = currentUser.username;
    // Não preenche a senha por segurança. O usuário terá que digitá-la para alterar.
    editPasswordInput.value = '';
    showScreen(profileScreen);
  } else {
    notify('Faça login para editar o perfil.');
  }
};

btnSaveProfile.onclick = async () => {
  if (!currentUser) { notify('Você precisa estar logado para salvar o perfil.'); return; }
  const newUsername = editUsernameInput.value.trim();
  const newPassword = editPasswordInput.value.trim();
  let newAvatarUrl = currentUser.avatar; // Manter o avatar atual por padrão

  // Lógica para upload de avatar (similar à imagem do post, idealmente um serviço de upload)
  if (editAvatarInput.files[0]) {
    newAvatarUrl = URL.createObjectURL(editAvatarInput.files[0]);
    // Em produção, você enviaria o arquivo para o backend e ele salvaria.
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: newUsername,
        password: newPassword || undefined, // Só envia se tiver uma nova senha
        avatar: newAvatarUrl
      })
    });
    const data = await response.json();
    if (response.ok) {
      currentUser.username = newUsername; // Atualiza o nome de usuário no frontend
      currentUser.avatar = newAvatarUrl; // Atualiza o avatar no frontend
      userDisplay.textContent = currentUser.username; // Atualiza o nome na tela principal
      notify('Perfil atualizado com sucesso!');
      showScreen(feedScreen);
      renderPosts(); // Para atualizar o avatar nos posts
    } else {
      notify(`Erro ao atualizar perfil: ${data.error}`);
    }
  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
    notify('Erro ao conectar com o servidor para salvar perfil.');
  }
};

// Stories
storyUpload.onchange = async () => {
  if (!currentUser) { notify('Faça login para adicionar uma story.'); return; }
  if (!storyUpload.files[0]) return;

  const imageUrl = URL.createObjectURL(storyUpload.files[0]);
  // Em produção, você faria um upload real para o servidor.
  try {
    const response = await fetch(`${API_BASE_URL}/stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, imageUrl })
    });
    const data = await response.json();
    if (response.ok) {
      notify('Story publicada!');
      renderStories();
    } else {
      notify(`Erro ao publicar story: ${data.error}`);
    }
  } catch (error) {
    console.error('Erro ao publicar story:', error);
    notify('Erro ao conectar com o servidor para publicar story.');
  }
};

async function renderStories() {
  storiesDiv.innerHTML = '';
  try {
    const response = await fetch(`${API_BASE_URL}/stories`);
    const stories = await response.json();

    stories.forEach(s => {
      const el = document.createElement('img');
      el.src = s.image_url; // Campo vindo do backend
      el.title = s.username; // Campo vindo do backend
      storiesDiv.appendChild(el);
    });
  } catch (error) {
    console.error('Erro ao carregar stories:', error);
    notify('Erro ao carregar stories do servidor.');
  }
}

// Chat direto
btnSendChat.onclick = async () => {
  if (!currentUser) { notify('Faça login para usar o chat.'); return; }
  const target = chatTarget.value.trim();
  const msg = chatMessage.value.trim();
  if (!target || !msg) return notify('Preencha o usuário e a mensagem.');

  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromUsername: currentUser.username, toUsername: target, text: msg })
    });
    const data = await response.json();
    if (response.ok) {
      notify(`Mensagem enviada para ${target}`);
      renderChat(target);
      chatMessage.value = '';
    } else {
      notify(`Erro ao enviar mensagem: ${data.error}`);
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    notify('Erro ao conectar com o servidor para enviar mensagem.');
  }
};

chatTarget.onblur = async () => {
  if (!currentUser) return;
  const target = chatTarget.value.trim();
  if (!target) {
    chatBox.innerHTML = '';
    return;
  }
  // Verificar se o usuário existe antes de tentar carregar o chat
  // No seu backend, as rotas de mensagem já fazem essa validação.
  // Poderíamos ter uma rota GET /api/users/:username para verificar a existência.
  renderChat(target); // Tenta renderizar o chat
};

async function renderChat(targetUsername) {
  chatBox.innerHTML = '';
  if (!currentUser || !targetUsername) return;

  try {
    const response = await fetch(`${API_BASE_URL}/messages/${targetUsername}/${currentUser.username}`);
    const messages = await response.json();

    if (messages.length === 0) {
      chatBox.innerHTML = '<i>Nenhuma conversa encontrada. Comece a digitar!</i>';
      return;
    }

    messages.forEach(m => {
      const el = document.createElement('div');
      el.textContent = `${m.fromUser}: ${m.text}`; // fromUser vem do JOIN no backend
      chatBox.appendChild(el);
    });
    chatBox.scrollTop = chatBox.scrollHeight; // Rolar para o final
  } catch (error) {
    console.error('Erro ao carregar chat:', error);
    chatBox.innerHTML = '<i>Erro ao carregar chat.</i>';
  }
}

// Inicializar
showScreen(loginScreen);