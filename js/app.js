const welcomeSection = document.querySelector('.welcome-content');
const nicknameField = document.querySelector('.field-for-nickname');
const existingMsg = document.querySelector('.existing-user');
const enterBtn = document.querySelector('.enter-btn');

const authorizedSection = document.querySelector('.authorized-content');
const guestList = document.querySelector('.guest-list');
const messagesList = document.querySelector('.messages-list');

const messageField = document.querySelector('.field-for-message');
const sendBtn = document.querySelector('.sending-message-btn');

const ws = new WebSocket('ws://valerie-sidman-ws-server.herokuapp.com');

function sendData(method, nickname, message, date) {
  const data = {
    method,
    nickname,
    message,
    date,
  };
  ws.send(JSON.stringify(data));
}

let you;

enterBtn.addEventListener('click', (e) => {
  e.preventDefault();
  sendData('login', nicknameField.value);
  you = nicknameField.value;
});

ws.onmessage = (response) => {
  const obj = JSON.parse(response.data);
  if (you) {
    if (obj.method === 'login') {
      if (obj.message === 'Already exists') {
        existingMsg.classList.remove('inactive');
      } else if (obj.message === 'Login successfully') {
        welcomeSection.classList.add('inactive');
        authorizedSection.classList.remove('inactive');
        const nickname = obj.nickname === you ? 'You' : obj.nickname;
        const guest = `
          <li class="guest">
            <div class="guest-avatar"></div>
            <div class="guest-name">${nickname}</div>
          </li>
        `;
        guestList.insertAdjacentHTML('beforeend', guest);
        if (obj.nickname === you) {
          sendData('users', you);
        }
      }
    } else if (obj.method === 'send') {
      const date = new Date(obj.date);
      const year = date.getFullYear();
      const month = `0${date.getMonth() + 1}`;
      const day = `0${date.getDate()}`;
      const hours = `0${date.getHours()}`;
      const minutes = `0${date.getMinutes()}`;
      const seconds = `0${date.getSeconds()}`;
      const formattedTime = `${day.substr(-2)}.${month.substr(-2)}.${year} ${hours.substr(-2)}:${minutes.substr(-2)}:${seconds.substr(-2)}`;
      const nickname = obj.nickname === you ? 'You' : obj.nickname;
      const clientMessage = obj.nickname === you ? ' client-message' : '';
      const message = `
        <li class="message${clientMessage}">
          <div class="message-header">
              <div class="message-sender">${nickname}</div>
              <div class="message-time">${formattedTime}</div>
          </div>
          <div class="message-body">${obj.message}</div>
        </li>
      `;
      messagesList.insertAdjacentHTML('beforeend', message);
    } else if (obj.method === 'users') {
      if (obj.nickname === you) {
        obj.message.forEach((user) => {
          if (user !== you) {
            const guest = `
            <li class="guest">
              <div class="guest-avatar"></div>
              <div class="guest-name">${user}</div>
            </li>
          `;
            guestList.insertAdjacentHTML('beforeend', guest);
          }
        });
      }
    } else if (obj.method === 'logout') {
      const guest = guestList.querySelectorAll('.guest');
      Array.from(guest).forEach((element) => {
        const guestName = element.querySelector('.guest-name');
        if (guestName.textContent === obj.nickname) {
          element.remove();
        }
      });
    }
  }
};

sendBtn.addEventListener('click', (e) => {
  e.preventDefault();
  sendData('send', you, messageField.value, Date.now());
  messageField.value = '';
});

messageField.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    sendData('send', you, messageField.value, Date.now());
    messageField.value = '';
  }
});

window.onunload = () => {
  sendData('logout', you);
};
