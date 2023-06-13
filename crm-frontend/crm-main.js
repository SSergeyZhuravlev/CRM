const container = document.querySelector('.crm__table__list');
const preloader = document.querySelector('.preloader');
const preloaderImg = document.querySelector('.preloader__img__wrapper');
const spinner = document.querySelector('.crm__add-form__btn__save__img');
const crmForm = document.querySelector('.crm__add-form');
const disabledItems = document.querySelectorAll('.disabled-while-loading');

// Получение списка пользователей
async function getUsers() {
  let response = await fetch (`http://localhost:3000/api/clients`);

  let result = await response.json();

  preloader.classList.add('hidden');
  preloaderImg.classList.add('hidden');

  return result
}

let usersList = [];
let dataList = await getUsers();
if (dataList) usersList = dataList;

// Создание записи о новом пользователе
async function setUser(obj) {
  spinner.classList.remove('hidden');

  disabledItems.forEach(element => {
    element.disabled = true;
  });

  let response = await fetch (`http://localhost:3000/api/clients`, {
    method: 'POST',
    body: JSON.stringify(obj),
    headers: {
      'Content-Type': 'application/json',
    }
  });

  spinner.classList.add('hidden');

  let newItem = await response.json();
  let responseStatus = response.status;

  return {
    response,
    newItem,
    responseStatus
  }
}

// Удаление пользователя
async function deleteUser(obj, element) {
  element.remove();

  await fetch(`http://localhost:3000/api/clients/${obj.id}`, {
    method: 'DELETE',
  });

  dataList = await getUsers();

  usersList = dataList;
  renderUsers(usersList);
}

function deleteModalWindow(userObj, userRow) {
  const deleteModalWrapper = document.createElement('div'),
        deleteModalContent = document.createElement('div'),
        deleteModalCloseBtn = document.createElement('button'),
        deleteModalTitle = document.createElement('h2'),
        deleteModalText = document.createElement('p'),
        deleteButtonsWrapper = document.createElement('div'),
        acceptDeleteBtn = document.createElement('button'),
        cancelDeleteBtn = document.createElement('button'),
        mainContainer = document.querySelector('.crm__main-content'),
        formDeleteBtn = document.querySelector('.crm__add-form__btn__delete');

  deleteModalWrapper.classList.add('delete__modal');
  deleteModalContent.classList.add('delete__modal__content');

  deleteModalCloseBtn.classList.add('delete__modal__content__close', 'btn', 'btn-reset');
  deleteModalCloseBtn.innerHTML = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.2332 1.73333L15.2665 0.766664L8.49985 7.53336L1.73318 0.766696L0.766515 1.73336L7.53318 8.50003L0.766542 15.2667L1.73321 16.2333L8.49985 9.46669L15.2665 16.2334L16.2332 15.2667L9.46651 8.50003L16.2332 1.73333Z" fill="#B0B0B0"/></svg>`

  deleteModalWrapper.addEventListener('click', e => {
    if (!e.target.closest('.delete__modal__content')) {
      deleteModalWrapper.classList.remove('open');
      if (formDeleteBtn) formDeleteBtn.remove();

      // Снимаем ограничения на фокус
      document.querySelectorAll('button').forEach(btn => {
        btn.removeAttribute('tabindex', '-1')
      })
    }
  })

  deleteModalCloseBtn.addEventListener('click', () => {
    deleteModalWrapper.classList.remove('open');
    if (formDeleteBtn) formDeleteBtn.remove();

    // Снимаем ограничения на фокус
    document.querySelectorAll('button').forEach(btn => {
      btn.removeAttribute('tabindex', '-1')
    })
  })

  deleteModalTitle.classList.add('delete__modal__content__title');
  deleteModalTitle.textContent = 'Удалить клиента';

  deleteModalText.classList.add('delete__modal__content__text');
  deleteModalText.textContent = 'Вы действительно хотите удалить данного клиента?';

  deleteButtonsWrapper.classList.add('delete__modal__content__buttons');
  acceptDeleteBtn.classList.add('delete__modal__content__accept', 'btn', 'btn-reset');
  acceptDeleteBtn.textContent = 'Удалить';
  acceptDeleteBtn.setAttribute('type', 'button');
  acceptDeleteBtn.addEventListener('click', () => {
    deleteUser(userObj, userRow)
    deleteModalWrapper.classList.remove('open');
    if (formDeleteBtn) formDeleteBtn.remove();

    // Снимаем ограничения на фокус
    document.querySelectorAll('button').forEach(btn => {
      btn.removeAttribute('tabindex', '-1')
  })
  })

  cancelDeleteBtn.classList.add('delete__modal__content__cancel', 'btn', 'btn-reset');
  cancelDeleteBtn.textContent = 'Отмена';
  cancelDeleteBtn.addEventListener('click', () => {
    deleteModalWrapper.classList.remove('open');
    if (formDeleteBtn) formDeleteBtn.remove();

    // Снимаем ограничения на фокус
    document.querySelectorAll('button').forEach(btn => {
      btn.removeAttribute('tabindex', '-1')
    })
  })

  deleteButtonsWrapper.append(acceptDeleteBtn, cancelDeleteBtn);
  deleteModalContent.append(deleteModalTitle, deleteModalText, deleteButtonsWrapper, deleteModalCloseBtn);
  deleteModalWrapper.append(deleteModalContent);
  mainContainer.append(deleteModalWrapper)

  return deleteModalWrapper
}

// Изменение данных пользователя
async function changeUser(obj, changes) {
  spinner.classList.remove('hidden');

  disabledItems.forEach(inp => {
    inp.disabled = true;
  });

  let response = await fetch(`http://localhost:3000/api/clients/${obj.id}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  let responseStatus = response.status;

  dataList = await getUsers();
  usersList = dataList;
  spinner.classList.add('hidden');

  return {
    response,
    responseStatus,
  }
}

// Поиск пользователя по ID
async function searchUserById(id) {
  let response = await fetch(`http://localhost:3000/api/clients/${id}`);

  let result = await response.json();
  return result
}

async function searchUserByString(str) {
  let response = await fetch(`http://localhost:3000/api/clients/?search=${str}`);

  let result = await response.json();
  return result
}

// Создание одного пользователя
function createUser(obj) {
  const userRow = document.createElement('tr');
  userRow.classList.add('crm__table__row');
  userRow.setAttribute('data-target', obj.id);

  // ID пользователя
  const userId = document.createElement('td');
  userId.classList.add('crm__table__id', 'crm__table__cell');
  let userIdNumber = Number(obj.id);
  userId.textContent = userIdNumber;

  // Ссылка на пользователя
  let userLink = new URL(window.location);
  userLink.hash = obj.id;
  const userLinkContainer = document.createElement('span');
  userLinkContainer.classList.add('crm__table__name__copyLink');
  userLinkContainer.textContent = userLink.href;

  // Кнопка "копировать ссылку на клиента"
  const copyLinkBtn = document.createElement('button');
  copyLinkBtn.classList.add('crm__table__name__copyBtn', 'btn-reset');
  copyLinkBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 2" height="16" id="Layer_2" viewBox="0 0 100 100" width="16"><title/><path d="M21,78a3,3,0,0,1-3-3V20a9,9,0,0,1,9-9H48a3,3,0,0,1,0,6H27a3,3,0,0,0-3,3V75A3,3,0,0,1,21,78Z"/><path d="M81.12,39.88l-16-16A3,3,0,0,0,63,23H39a9,9,0,0,0-9,9V80a9,9,0,0,0,9,9H73a9,9,0,0,0,9-9V42A3,3,0,0,0,81.12,39.88ZM65,43a3,3,0,0,1-3-3V27L78,43Z"/></svg>`;

  copyLinkBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(userLinkContainer.textContent);
    const copied = document.createElement('span');
    copied.className = 'copied';
    copied.style.color = '#333';
    copied.style.backgroundColor = 'transparent';
    copied.style.fontSize = '9px';
    copied.innerHTML = 'Скопировано';
    copyLinkBtn.prepend(copied)

    setTimeout(() => {
      copyLinkBtn.removeChild(copied)
    }, 400)
  })

  //ФИО пользователя
  obj.fullName = `${obj.surname + ' ' + obj.name + ' ' + obj.lastName}`;
  const userFullName = document.createElement('td');
  const userFullNameText = document.createElement('span');
  userFullName.classList.add('crm__table__name', 'crm__table__cell');
  userFullNameText.textContent = obj.fullName;
  userFullNameText.append(userLinkContainer, copyLinkBtn);
  userFullName.append(userFullNameText);

  // Дата создания пользователя
  const userCreateDate = document.createElement('td');
  const createdFulldate = document.createElement('span');
  const createdTime = document.createElement('span');

  userCreateDate.classList.add('crm__table__cell__create-time', 'crm__table__cell');
  createdFulldate.classList.add('crm__table__cell__create-time--fulldate');
  createdTime.classList.add('crm__table__cell__create-time--time');

  let createdDate = new Date(obj.createdAt);
  createdFulldate.textContent = createdDate.toLocaleDateString();
  createdTime.textContent = createdDate.toLocaleTimeString();
  userCreateDate.append(createdFulldate);
  userCreateDate.append(createdTime);

  // Дата изменения пользователя
  const userChangeDate = document.createElement('td');
  const changedFulldate = document.createElement('span');
  const changedTime = document.createElement('span');

  userChangeDate.classList.add('crm__table__cell__change-time', 'crm__table__cell');
  changedFulldate.classList.add('crm__table__cell__change-time--fulldate');
  changedTime.classList.add('crm__table__cell__change-time--time');

  let changedDate = new Date(obj.updatedAt);
  changedFulldate.textContent = changedDate.toLocaleDateString();
  changedTime.textContent = changedDate.toLocaleTimeString();
  userChangeDate.append(changedFulldate);
  userChangeDate.append(changedTime);

  // Создание контактов
  const userContacts = document.createElement('td');
  const userContactsList = document.createElement('ul');

  userContacts.classList.add('crm__table__cell__contacts', 'crm__table__cell');
  userContactsList.classList.add('contacts__list', 'list-reset')

  function createContacts() {
    let objContacts = obj.contacts;

      for (const item of objContacts) {
      const contactWrapper = document.createElement('li');
      const contactButton = document.createElement('button');
      const contactImg = document.createElement('span');
      const contactPopup = document.createElement('span');
      const contactPopupType = document.createElement('span');
      const contactPopupContact = document.createElement('span');
      const telSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.7"><circle cx="8" cy="8" r="8" fill="#9873FF"/><path d="M11.56 9.50222C11.0133 9.50222 10.4844 9.41333 9.99111 9.25333C9.83556 9.2 9.66222 9.24 9.54222 9.36L8.84444 10.2356C7.58667 9.63556 6.40889 8.50222 5.78222 7.2L6.64889 6.46222C6.76889 6.33778 6.80444 6.16444 6.75556 6.00889C6.59111 5.51556 6.50667 4.98667 6.50667 4.44C6.50667 4.2 6.30667 4 6.06667 4H4.52889C4.28889 4 4 4.10667 4 4.44C4 8.56889 7.43556 12 11.56 12C11.8756 12 12 11.72 12 11.4756V9.94222C12 9.70222 11.8 9.50222 11.56 9.50222Z" fill="white"/></g></svg>`;

      const mailSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4 5.75C4 5.3375 4.36 5 4.8 5H11.2C11.64 5 12 5.3375 12 5.75V10.25C12 10.6625 11.64 11 11.2 11H4.8C4.36 11 4 10.6625 4 10.25V5.75ZM8.424 8.1275L11.04 6.59375C11.14 6.53375 11.2 6.4325 11.2 6.32375C11.2 6.0725 10.908 5.9225 10.68 6.05375L8 7.625L5.32 6.05375C5.092 5.9225 4.8 6.0725 4.8 6.32375C4.8 6.4325 4.86 6.53375 4.96 6.59375L7.576 8.1275C7.836 8.28125 8.164 8.28125 8.424 8.1275Z" fill="#9873FF"/></svg>`;

      const fbImg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.7"><path d="M7.99999 0C3.6 0 0 3.60643 0 8.04819C0 12.0643 2.928 15.3976 6.75199 16V10.3775H4.71999V8.04819H6.75199V6.27309C6.75199 4.25703 7.94399 3.14859 9.77599 3.14859C10.648 3.14859 11.56 3.30121 11.56 3.30121V5.28514H10.552C9.55999 5.28514 9.24799 5.90362 9.24799 6.53815V8.04819H11.472L11.112 10.3775H9.24799V16C11.1331 15.7011 12.8497 14.7354 14.0879 13.2772C15.3261 11.819 16.0043 9.96437 16 8.04819C16 3.60643 12.4 0 7.99999 0Z" fill="#9873FF"/></g></svg>`;

      const vkImg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.7"><path d="M8 0C3.58187 0 0 3.58171 0 8C0 12.4183 3.58187 16 8 16C12.4181 16 16 12.4183 16 8C16 3.58171 12.4181 0 8 0ZM12.058 8.86523C12.4309 9.22942 12.8254 9.57217 13.1601 9.97402C13.3084 10.1518 13.4482 10.3356 13.5546 10.5423C13.7065 10.8371 13.5693 11.1604 13.3055 11.1779L11.6665 11.1776C11.2432 11.2126 10.9064 11.0419 10.6224 10.7525C10.3957 10.5219 10.1853 10.2755 9.96698 10.037C9.87777 9.93915 9.78382 9.847 9.67186 9.77449C9.44843 9.62914 9.2543 9.67366 9.1263 9.90707C8.99585 10.1446 8.96606 10.4078 8.95362 10.6721C8.93577 11.0586 8.81923 11.1596 8.43147 11.1777C7.60291 11.2165 6.81674 11.0908 6.08606 10.6731C5.44147 10.3047 4.94257 9.78463 4.50783 9.19587C3.66126 8.04812 3.01291 6.78842 2.43036 5.49254C2.29925 5.2007 2.39517 5.04454 2.71714 5.03849C3.25205 5.02817 3.78697 5.02948 4.32188 5.03799C4.53958 5.04143 4.68362 5.166 4.76726 5.37142C5.05633 6.08262 5.4107 6.75928 5.85477 7.38684C5.97311 7.55396 6.09391 7.72059 6.26594 7.83861C6.45582 7.9689 6.60051 7.92585 6.69005 7.71388C6.74734 7.57917 6.77205 7.43513 6.78449 7.29076C6.82705 6.79628 6.83212 6.30195 6.75847 5.80943C6.71263 5.50122 6.53929 5.30218 6.23206 5.24391C6.07558 5.21428 6.0985 5.15634 6.17461 5.06697C6.3067 4.91245 6.43045 4.81686 6.67777 4.81686L8.52951 4.81653C8.82136 4.87382 8.88683 5.00477 8.92645 5.29874L8.92808 7.35656C8.92464 7.47032 8.98521 7.80751 9.18948 7.88198C9.35317 7.936 9.4612 7.80473 9.55908 7.70112C10.0032 7.22987 10.3195 6.67368 10.6029 6.09801C10.7279 5.84413 10.8358 5.58142 10.9406 5.31822C11.0185 5.1236 11.1396 5.02785 11.3593 5.03112L13.1424 5.03325C13.195 5.03325 13.2483 5.03374 13.3004 5.04274C13.6009 5.09414 13.6832 5.22345 13.5903 5.5166C13.4439 5.97721 13.1596 6.36088 12.8817 6.74553C12.5838 7.15736 12.2661 7.55478 11.9711 7.96841C11.7001 8.34652 11.7215 8.53688 12.058 8.86523Z" fill="#9873FF"/></g></svg>`;

      const defaultImg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z" fill="#9873FF"/></svg>`;

      contactWrapper.classList.add('contact__wrapper');
      contactButton.classList.add('btn-reset', 'crm__table__cell__contacts__button')
      contactImg.classList.add('crm__table__cell__contacts--img');
      contactPopup.classList.add('crm__table__cell__contacts--popup');
      contactPopupType.textContent = `${item.type}: `;
      contactPopupContact.style.color = '#B89EFF';

      contactButton.addEventListener('focus', () => {
        contactPopup.style.visibility = 'visible';
        contactPopup.style.opacity = '1';
        contactPopup.style.zIndex = '1';
      })

      contactButton.addEventListener('blur', () => {
        contactPopup.style.visibility = 'hidden';
        contactPopup.style.opacity = '0';
        contactPopup.style.zIndex = '0';
      })

      if (item.type === 'Facebook' || item.type === 'Vk') {
        let url = new URL(item.value);
        let pathname = url.pathname.replace('/', '@');

        contactPopupContact.textContent = `${pathname}`;
      } else if (item.type === 'Телефон') {
        if (!item.value.includes('+')) {
          contactPopupContact.textContent = `${'+' + item.value}`;
        } else contactPopupContact.textContent = `${item.value}`;

      } else contactPopupContact.textContent = `${item.value}`;

      switch (item.type) {
        case 'Телефон': contactImg.innerHTML = telSvg;

          break;

        case 'Email': contactImg.innerHTML = mailSvg;

          break;

        case 'Facebook': contactImg.innerHTML = fbImg;

          break;

        case 'Vk': contactImg.innerHTML = vkImg;

          break;

        default: contactImg.innerHTML = defaultImg;

          break;
      }

      contactPopup.append(contactPopupType, contactPopupContact)
      contactButton.append(contactImg, contactPopup)
      contactWrapper.append(contactButton);
      userContactsList.append(contactWrapper);
      userContacts.append(userContactsList);
    }

    return userContacts
  }

  createContacts();

  if (userContactsList.childNodes.length > 5) {
    userContactsList.classList.add('hide-child');

    const contactsShowBtnLi = document.createElement('li');
    const contactsShowBtn = document.createElement('button');
    contactsShowBtn.classList.add('btn-reset', 'contacts__show__btn');
    contactsShowBtn.textContent = `${'+'}${userContactsList.childNodes.length - 4}`;

    contactsShowBtn.addEventListener('click', () => {
      userContactsList.classList.remove('hide-child');
      userContactsList.removeChild(contactsShowBtnLi);
    })

    contactsShowBtnLi.append(contactsShowBtn)
    userContactsList.append(contactsShowBtnLi);
  }


  // Кнопки
  const controlBtns = document.createElement('td');
  const btnsWrapper = document.createElement('div');
  const changeBtn = document.createElement('button');
  const deleteBtn = document.createElement('button');
  const changeBtnText = document.createElement('span');
  const deleteBtnText = document.createElement('span');

  controlBtns.classList.add('crm__table__cell');
  btnsWrapper.classList.add('crm__table__cell__btns');
  changeBtn.classList.add('table__change__btn', 'btn', 'btn-reset');
  deleteBtn.classList.add('table__delete__btn', 'btn', 'btn-reset');

  changeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.7" clip-path="url(#clip0_224_2140)"><path d="M2 11.5V14H4.5L11.8733 6.62662L9.37333 4.12662L2 11.5ZM13.8067 4.69329C14.0667 4.43329 14.0667 4.01329 13.8067 3.75329L12.2467 2.19329C11.9867 1.93329 11.5667 1.93329 11.3067 2.19329L10.0867 3.41329L12.5867 5.91329L13.8067 4.69329Z" fill="#9873FF"/></g><defs><clipPath id="clip0_224_2140"><rect width="16" height="16" fill="white"/></clipPath></defs></svg>`;
  changeBtnText.textContent = 'Изменить';
  deleteBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.7" clip-path="url(#clip0_224_2145)"><path d="M8 2C4.682 2 2 4.682 2 8C2 11.318 4.682 14 8 14C11.318 14 14 11.318 14 8C14 4.682 11.318 2 8 2ZM8 12.8C5.354 12.8 3.2 10.646 3.2 8C3.2 5.354 5.354 3.2 8 3.2C10.646 3.2 12.8 5.354 12.8 8C12.8 10.646 10.646 12.8 8 12.8ZM10.154 5L8 7.154L5.846 5L5 5.846L7.154 8L5 10.154L5.846 11L8 8.846L10.154 11L11 10.154L8.846 8L11 5.846L10.154 5Z" fill="#F06A4D"/></g><defs><clipPath id="clip0_224_2145"><rect width="16" height="16" fill="white"/></clipPath></defs></svg>`;
  deleteBtnText.textContent = 'Удалить';

  changeBtn.addEventListener('click', () => {
    openAddForm('Изменить данные', obj.id, obj, userRow);
    crmForm.scrollIntoView();
  });

  deleteBtn.addEventListener('click', () => {
    // Ограничиваем фокус только кнопками внутри модального окна
    document.querySelectorAll('button').forEach(btn => {
      if (!btn.closest('.delete__modal__content')) {

        btn.setAttribute('tabindex', '-1')
      }
    });

    let deleteWindow = deleteModalWindow(obj, userRow);
    setTimeout(() => {
      deleteWindow.classList.add('open')
    }, 100)
  });

  changeBtn.append(changeBtnText);
  deleteBtn.append(deleteBtnText);
  btnsWrapper.append(changeBtn, deleteBtn);
  controlBtns.append(btnsWrapper);
  userRow.append(userId, userFullName, userCreateDate, userChangeDate, userContacts, controlBtns);

  return userRow
}

// Отрисовка пользователей
function renderUsers(arr) {
  container.innerHTML = '';

  let usersArr = [...arr];

  for (const item of usersArr) {
    container.append(createUser(item))
  }
}


// Управление модальным окном
const formWraper = document.querySelector('.form__wrapper'),
      formOpenBtn = document.querySelector('.crm__add-form__add-btn'),
      changeFormBtns = document.querySelectorAll('.table__change__btn'),
      nameInput = document.querySelector('.new-name'),
      surnameInput = document.querySelector('.new-surname'),
      lastnameInput = document.querySelector('.new-lastname'),
      contactsContainer = document.querySelector('.crm__add-form__contacts'),
      formCloseBtn = document.querySelector('.crm__add-form__close-btn'),
      formAddContactBtn = document.querySelector('.crm__add-form__btn__contacts'),
      cancelBtn = document.querySelector('.crm__add-form__btn__cancel'),
      formTitle = document.querySelector('.crm__add-form__title'),
      idSpan = document.createElement('span');

function openAddForm(title, id, userObj, row) {
  // Ограничиваем фокус только кнопками внутри модального окна
  document.querySelectorAll('button').forEach(btn => {
    if (!btn.closest('.crm__add-form')) {

      btn.setAttribute('tabindex', '-1')
    }
  });

  disabledItems.forEach(element => {
    element.removeAttribute('disabled')
  });

  idSpan.classList.add('crm__add-form__title__id')
  idSpan.textContent = id;

  if (id !== undefined) {
    formTitle.textContent = `${title + ' ' + 'ID:'}`;
    formTitle.append(idSpan);

    nameInput.value = userObj.name
    surnameInput.value = userObj.surname;
    lastnameInput.value = userObj.lastName;

    for (const item of userObj.contacts) {
      createContactSelect(item)
    }

    if (contactsContainer.childNodes.length < 10) {
      formAddContactBtn.classList.remove('hidden');
    } else if (contactsContainer.childNodes.length > 9) {
      formAddContactBtn.classList.add('hidden');
    }

    const addFormBtnWrapper = document.querySelector('.crm__add-form__btn__wrapper');
    const formDeleteBtn = document.createElement('button');
    formDeleteBtn.classList.add('btn-reset', 'crm__add-form__btn__delete', 'disabled-while-loading');
    formDeleteBtn.textContent = 'Удалить';
    formDeleteBtn.addEventListener('click', () => {
      // Ограничиваем фокус только кнопками внутри модального окна
      document.querySelectorAll('button').forEach(btn => {
        if (!btn.closest('.delete__modal__content')) {

          btn.setAttribute('tabindex', '-1')
        }
      });

      let deleteWindow = deleteModalWindow(userObj, row);
      setTimeout(() => {
        deleteWindow.classList.add('open')
      }, 100);
    })

    addFormBtnWrapper.append(formDeleteBtn);
    cancelBtn.classList.add('hidden');
  } else {
    formTitle.textContent = title;
    cancelBtn.classList.remove('hidden');
    formAddContactBtn.classList.remove('hidden');
  }

  cancelBtn.addEventListener('click', () => {
    formWraper.classList.remove('open');

    nameInput.value = '';
    surnameInput.value = '';
    lastnameInput.value = '';

    while (contactsContainer.firstChild) {
      contactsContainer.removeChild(contactsContainer.firstChild);
    }

    // Снимаем ограничения на фокус
    document.querySelectorAll('button').forEach(btn => {
      btn.removeAttribute('tabindex', '-1')
    })
  });

  formWraper.classList.add('open');

  crmForm.addEventListener('click', event => {
    event._isClicked = true
  })

  formWraper.addEventListener('click', e => {
    if (e._isClicked) return

    formWraper.classList.remove('open');

    const formDeleteBtn = document.querySelector('.crm__add-form__btn__delete');
    if (formDeleteBtn) formDeleteBtn.remove();

    nameInput.value = '';
    surnameInput.value = '';
    lastnameInput.value = '';

    while (contactsContainer.firstChild) {
      contactsContainer.removeChild(contactsContainer.firstChild);
    }
  })

  formCloseBtn.addEventListener('click', () => {
    formWraper.classList.remove('open');

    const formDeleteBtn = document.querySelector('.crm__add-form__btn__delete');
    if (formDeleteBtn) formDeleteBtn.remove();

    nameInput.value = '';
    surnameInput.value = '';
    lastnameInput.value = '';

    while (contactsContainer.firstChild) {
      contactsContainer.removeChild(contactsContainer.firstChild);
    }

    // Снимаем ограничения на фокус
    document.querySelectorAll('button').forEach(btn => {
        btn.removeAttribute('tabindex', '-1')
    })
  });

  return formWraper
}

// Открытие модального окна для нового клиента
formOpenBtn.addEventListener('click', () => {
  openAddForm('Новый клиент');
  crmForm.scrollIntoView();
});

// Создание селекта с контактами
let formSelectWrapper, formSelect, optionPhone, optionOther, optionEmail, optionVk, optionFb, contactsInput, deleteContactBtn;
function createContactSelect(contactObj) {
  formSelectWrapper = document.createElement('div'),
  formSelect = document.createElement('select'),
  optionPhone = document.createElement('option'),
  optionOther = document.createElement('option'),
  optionEmail = document.createElement('option'),
  optionVk = document.createElement('option'),
  optionFb = document.createElement('option'),
  contactsInput = document.createElement('input'),
  deleteContactBtn = document.createElement('button');

  formSelectWrapper.classList.add('crm__add-form__select-wrapper');
  formSelect.classList.add('crm__add-form__select');
  optionPhone.classList.add('crm__add-form__select__type', 'crm__add-form__select__type--tel');
  optionOther.classList.add('crm__add-form__select__type');
  optionEmail.classList.add('crm__add-form__select__type', 'crm__add-form__select__type--email');
  optionVk.classList.add('crm__add-form__select__type');
  optionFb.classList.add('crm__add-form__select__type');
  contactsInput.classList.add('crm__add-form__input-contact');
  deleteContactBtn.classList.add('crm__add-form__delete-contact-btn', 'btn-reset', 'hidden');

  if (contactObj) {
    contactsInput.value = contactObj.value;
    deleteContactBtn.classList.remove('hidden');

    switch (contactObj.type) {
      case 'Телефон':
        optionPhone.selected = true;
        break;

      case 'Другое':
        optionOther.selected = true;
        break;

      case 'Email':
        optionEmail.selected = true;
        break;

      case 'Facebook':
        optionFb.selected = true;
        let splitStrFb = contactsInput.value.split('https://').join(' ');
        contactsInput.value = splitStrFb;
        break;

      case 'Vk':
        optionVk.selected = true;
        let splitStrVk = contactsInput.value.split('https://').join(' ');
        contactsInput.value = splitStrVk;
        break;


      default:
        break;
    }
  }

  optionPhone.textContent = 'Телефон';
  optionOther.textContent = 'Другое';
  optionEmail.textContent = 'Email';
  optionVk.textContent = 'Vk';
  optionFb.textContent = 'Facebook';
  contactsInput.placeholder = 'Введите данные контакта';
  if (window.innerWidth <= 540) contactsInput.placeholder = 'Введите данные';

  deleteContactBtn.type = 'button';
  deleteContactBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_224_6681)"><path d="M8 2C4.682 2 2 4.682 2 8C2 11.318 4.682 14 8 14C11.318 14 14 11.318 14 8C14 4.682 11.318 2 8 2ZM8 12.8C5.354 12.8 3.2 10.646 3.2 8C3.2 5.354 5.354 3.2 8 3.2C10.646 3.2 12.8 5.354 12.8 8C12.8 10.646 10.646 12.8 8 12.8ZM10.154 5L8 7.154L5.846 5L5 5.846L7.154 8L5 10.154L5.846 11L8 8.846L10.154 11L11 10.154L8.846 8L11 5.846L10.154 5Z" fill=""/></g><defs><clipPath id="clip0_224_6681"><rect width="16" height="16" fill="white"/></clipPath></defs></svg>`;

  formSelect.append(optionPhone, optionOther, optionEmail, optionVk, optionFb);
  formSelectWrapper.append(formSelect, contactsInput, deleteContactBtn);
  contactsContainer.append(formSelectWrapper);
  contactsContainer.classList.add('active');

  const choices = new Choices(formSelect, {
    itemSelectText: '',
    searchEnabled: false,
  });

  contactsInput.addEventListener('input', () => {
    deleteContactBtn.classList.remove('hidden');
  });

  deleteContactBtn.addEventListener('click', (e) => {
    e.target.closest('.crm__add-form__select-wrapper').remove();

    if (contactsContainer.childNodes.length < 10) {
      formAddContactBtn.classList.remove('hidden');
    }

    if (!contactsContainer.hasChildNodes()) contactsContainer.classList.remove('active');
  });

  return {
    formSelectWrapper,
    formSelect,
    contactsInput,
    deleteContactBtn,
  }
}

// Добавление нового контакта
const btnWrapper = document.querySelector('.add-contact__btn__wrapper');
formAddContactBtn.addEventListener('click', () => {
  if (contactsContainer.childNodes.length === 9) {
    formAddContactBtn.classList.add('hidden');
  }

  if (!contactsContainer.hasChildNodes() || (contactsContainer.hasChildNodes() && contactsInput.value)) {
    createContactSelect();

    const errors = document.querySelectorAll('.error');
    for (let i = 0; i < errors.length; i++) {
      errors[i].remove();
    }
  } else {
    contactsInput.before(createErrorMessage('Заполните поле'));
    return
  }
});

// // Сообщение об ошибках
function createErrorMessage(text) {
  const error = document.createElement('span');
  error.classList.add('error');
  error.style.color = 'red';
  error.style.backgroundColor = 'transparent';
  error.style.fontSize = '9px';
  error.innerHTML = text;

  return error
}

// Отправка формы
crmForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const errors = document.querySelectorAll('.error');
    for (let i = 0; i < errors.length; i++) {
      errors[i].remove();
    }

    // Валидация на пустоту у инпутов
    const fields = document.querySelectorAll('.required-input');
    for (let i = 0; i < fields.length; i++) {
      if (!fields[i].value.trim()) {
        fields[i].before(createErrorMessage('Заполните поле'));
      }
    }

    if (!nameInput.value || !surnameInput.value) return

    // Создание массива контактов
    const newUserContacts = [];
    const selectWrapper = document.querySelectorAll('.crm__add-form__select-wrapper');
    if (contactsContainer.hasChildNodes()) {
      for (let item of selectWrapper) {
        let wrapperNodes = item.childNodes;
        let selectValue = wrapperNodes[0].childNodes[0].childNodes[0].value;
        let inputValue = wrapperNodes[1].value;
        let newContact = {
          type: selectValue,
          value: inputValue.trim(),
        };

        // Валидация контакта на пустоту и длину
        if (!inputValue) {
          item.append(createErrorMessage('Не заполнен контакт'));
          return
        }

        // Валидация телефона
        const reg = /^[0-9\s]*$/;
        if ((selectValue === 'Телефон') && !reg.test(inputValue)) {
          item.append(createErrorMessage('Только цифры!'));
          return
        }

        if (selectValue === 'Телефон') {
          if (inputValue.trim().length > 15) {
            item.append(createErrorMessage('Не более 15 символов'));
            return
          } else if (inputValue.trim().length < 3) {
            item.append(createErrorMessage('Не менее 3 символов'));
            return
          }
        }

        // Валидация email на корректность
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if ((selectValue === 'Email') && !re.test(inputValue.toLowerCase())) {
          item.append(createErrorMessage('Некорректный email'));
          return
        }

        // Валидация VK и FB
        if (selectValue === 'Vk' || selectValue === 'Facebook') {
          newContact.value = `${'https://'+inputValue.trim()}`
        }

        const regex = /(^https?:\/\/)?[a-z0-9~_\-\.]+\.[a-z]{2,9}(\/[a-zA-Z0-9!-~\-\.]+)?$/i;
        if ((selectValue === 'Facebook' && !regex.test(inputValue)) || (selectValue === 'Facebook' && !inputValue.includes('facebook.com/'))) {
          item.append(createErrorMessage('Введите в формате facebook.com/userid'));
          return
        } else if ((selectValue === 'Vk' && !regex.test(inputValue)) || (selectValue === 'Vk' && !inputValue.includes('vk.com/'))) {
          item.append(createErrorMessage('Введите в формате vk.com/userid'));
          return
        }

        newUserContacts.push(newContact);
      }
    }

    // Объект нового/измененного пользователя
    let userSurname = `${surnameInput.value.trim().slice(0, 1).toUpperCase() + surnameInput.value.trim().slice(1).toLowerCase()}`;
    let userName = `${nameInput.value.trim().slice(0, 1).toUpperCase() + nameInput.value.trim().slice(1).toLowerCase()}`;
    let userLastname = `${lastnameInput.value.trim().slice(0, 1).toUpperCase() + lastnameInput.value.trim().slice(1).toLowerCase()}`;

    let newUser = {
      name: userName,
      surname: userSurname,
      lastName: userLastname,
      contacts: newUserContacts,
    };

    let userId = Number(idSpan.textContent);
    if (userId === 0) {
      let setNewUser = await setUser(newUser);

      const addFormBtnWrapper = document.querySelector('.crm__add-form__btn__wrapper');
      if (setNewUser.responseStatus === 404 || setNewUser.responseStatus === 422) {
        addFormBtnWrapper.prepend(createErrorMessage('Что-то пошло не так. Некорректные данные!'));
        return
      }

      if (setNewUser.responseStatus === 500) {
        addFormBtnWrapper.prepend(createErrorMessage('Ой! Сервер прилег отдохнуть, но мы уже чиним это.'));
        return
      }

      usersList.push(setNewUser.newItem);
      renderUsers(usersList);
    } else {
      let searchedUser = await searchUserById(userId);
      let changingUser = await changeUser(searchedUser, newUser);

      if (changingUser.responseStatus === 404 || changingUser.responseStatus === 422) {
        addFormBtnWrapper.prepend(createErrorMessage('Что-то пошло не так. Некорректные данные!'));
        return
      }

      if (changingUser.responseStatus === 500) {
        addFormBtnWrapper.prepend(createErrorMessage('Ой! Сервер прилег отдохнуть, но мы уже чиним это.'));
        return
      }

      renderUsers(usersList);
    }

    nameInput.value = '';
    surnameInput.value = '';
    lastnameInput.value = '';

    for (let i = 0; i < selectWrapper.length; i++) {
      selectWrapper[i].remove();
    }

    formWraper.classList.remove('open');

    const formDeleteBtn = document.querySelector('.crm__add-form__btn__delete');
    if (formDeleteBtn) formDeleteBtn.remove();

    // Снимаем ограничения на фокус
    document.querySelectorAll('button').forEach(btn => {
      btn.removeAttribute('tabindex', '-1')
    })
  });

  // Сортировка пользователей
  function sortUsers(arr, prop, dir = true) {
    return arr.sort((a, b) => {
      if (prop === 'id') return dir ? a[prop] - b[prop] : b[prop] - a[prop]

      let sortDir = a[prop] < b[prop];

      if (dir === false) sortDir = a[prop] > b[prop]

      return sortDir ? -1 : 1
    })
  }

  // Сортировка по умолчанию при загрузке страницы
  document.addEventListener('DOMContentLoaded', renderUsers(sortUsers(usersList, 'id')));

  // Сортировка по столбцам
  let sortDirection = false;

  // ID
  document.querySelector('.crm__table__th__btn--id').addEventListener('click', () => {
    renderUsers(sortUsers(usersList, 'id', sortDirection));
    sortDirection = !sortDirection;
    document.querySelector('.crm__table__th__id').classList.toggle('rotate');
  });

  // ФИО
  document.querySelector('.crm__table__th__btn--fullname').addEventListener('click', () => {
    renderUsers(sortUsers(usersList, 'fullName', sortDirection));
    sortDirection = !sortDirection;
    document.querySelector('.crm__table__th__name').classList.toggle('rotate');
  });

  // Дата создания
  document.querySelector('.crm__table__th__btn--createtime').addEventListener('click', () => {
    renderUsers(sortUsers(usersList, 'createdAt', sortDirection));
    sortDirection = !sortDirection;
    document.querySelector('.crm__table__th__time').classList.toggle('rotate');
  });

  // Дата изменения
  document.querySelector('.crm__table__th__btn--changetime').addEventListener('click', () => {
    renderUsers(sortUsers(usersList, 'updatedAt', sortDirection));
    sortDirection = !sortDirection;
    document.querySelector('.crm__table__th__time--change').classList.toggle('rotate');
  });

  // Поиск клиента в поисковой строке
  const searchContainer = document.querySelector('.search__wrapper');
  const searchInput = document.querySelector('.header__search');
  const autocompleteList = document.querySelector('.autocomplite-list');
  const searchBtn = document.querySelector('.header__search__btn');

  // Кнопка поиска на 320
  searchBtn.addEventListener('click', () => {
    searchContainer.classList.toggle('active');
  })

  searchInput.addEventListener('input', async () => {
    const searchStr = searchInput.value;
    setTimeout(async () => {
      // Изначально очищаем список автодополнений
      autocompleteList.innerHTML = ''

      let searchedUser = await searchUserByString(searchStr);

      // Если поле ввода пустое - очищаем список
      if (searchInput.value.trim() === '') {
        while (autocompleteList.firstChild) {
          autocompleteList.removeChild(autocompleteList.firstChild);
          autocompleteList.style.zIndex = '-1';
        }

        return
      }

      document.body.addEventListener('click', (e) => {
        if (!e.target.closest('search__wrapper')) {
          while (autocompleteList.firstChild) {
            autocompleteList.removeChild(autocompleteList.firstChild);
            document.body.style.overflowY = 'auto';
            autocompleteList.style.zIndex = '-1';
          };
        }
      })

      // Создаем элементы на основе введенного в поле запроса
      for (const item of searchedUser) {
        const autocompleteItem = document.createElement('li');
        autocompleteItem.classList.add('autocomplite-item')
        autocompleteItem.textContent = `${item.surname + ' ' + item.name + ' ' + item.lastName}`;
        autocompleteItem.style.cursor = 'pointer';
        autocompleteItem.setAttribute('data-path', item.id);
        autocompleteItem.setAttribute('tabindex', '0');
        document.body.style.overflowY = 'hidden';

        // При нажатии на элемент - скроллим до нужного пользователя
        function scrollToUser() {
          let path = autocompleteItem.dataset.path;
          let target = document.querySelector(`[data-target="${path}"]`);

          target.scrollIntoView();
          target.classList.add('highlight');

          setTimeout(() => {
            target.classList.remove('highlight');
          }, 700);

          while (autocompleteList.firstChild) {
            searchContainer.classList.remove('active');
            autocompleteList.removeChild(autocompleteList.firstChild);
            document.body.style.overflowY = 'auto';
            autocompleteList.style.zIndex = '-1';
          };

          searchInput.value = '';
        }

        autocompleteItem.addEventListener('click', scrollToUser);

        // Добавляем событие при нажатии на Enter
        autocompleteItem.addEventListener('keydown', (key) => {
          if (key.code === 'Enter') scrollToUser();
        });

        autocompleteList.append(autocompleteItem);
        autocompleteList.style.zIndex = '1000';
      }
    }, 300);
  })

  // Создаем событие для нажатия кнопок "вверх" и "вниз"
  searchInput.addEventListener('keydown', function(event) {
    let currentFocus = 0;

    // Извачально попадаем в список на первый элемент
    if (event.code === 'ArrowDown') {
      autocompleteList.children[currentFocus].focus();
    }

    // Настройка стрелок, находясь внутри списка
    autocompleteList.addEventListener('keydown', function(event) {
      if (event.code === 'ArrowDown') {
        ++currentFocus
        if (currentFocus >= autocompleteList.childNodes.length) currentFocus = 0;
        autocompleteList.children[currentFocus].focus();
      }

      if (event.code === 'ArrowUp') {
        --currentFocus
        if (currentFocus < 0) currentFocus += autocompleteList.childNodes.length;
        autocompleteList.children[currentFocus].focus()
      }

    })
  })

  // Событие для открытия окна пользователя по ссылке
  window.addEventListener('hashchange', async () => {
    let id = location.hash.slice(1);
    let user = await searchUserById(id);

    openAddForm('Изменить данные', id, user);

    crmForm.scrollIntoView();

    window.history.pushState('', '', window.location.pathname);
  })

  if (window.location.hash) {
    let id = location.hash.slice(1);
    let user = await searchUserById(id);

    openAddForm('Изменить данные', id, user);

    crmForm.scrollIntoView();

    window.history.pushState('', '', window.location.pathname);
  }
