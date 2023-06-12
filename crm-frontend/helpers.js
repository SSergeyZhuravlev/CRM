// Сообщение об ошибках
export function createErrorMessage(text) {
  const error = document.createElement('span');
  error.classList.add('error');
  error.style.color = 'red';
  error.style.backgroundColor = 'transparent';
  error.style.fontSize = '9px';
  error.innerHTML = text;

  return error
}
