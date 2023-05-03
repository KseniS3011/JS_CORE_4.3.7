"use strict";

let containerForm = document.querySelector(".container-form");
let containerRepo = document.querySelector(".container-repo");
let form = document.querySelector(".form");
let input = document.querySelector(".search-field");
let message = document.querySelector(".hidden");
let autoComplete;
let repos;

containerForm.addEventListener("submit", submitForm);
containerRepo.addEventListener("click", closeRepo);

//Валидация формы

function submitForm(event) {
  event.preventDefault();
  clearAutoComplete(autoComplete);
  clearMessage();
  input.value = "";
}

//Удаление выбранного репозитория при нажатии на крестик

function closeRepo(event) {
  if (event.target.tagName !== "BUTTON") return;
  toClearRepo(event.target.closest("div"));
}

const debounce = (fn, debounceTime) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, debounceTime);
  };
};

const debounceFn = debounce(inputChange, 400);
input.addEventListener("input", debounceFn);

//Получение данных с сервера

async function getResponse() {
  let url = new URL("https://api.github.com/search/repositories");
  url.searchParams.set("q", input.value);
  url.searchParams.set("per_page", 5);
  if (input.value.trim()) {
    try {
      let response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Ошибка ${response.status} при получении данных. Попробуйте перезагрузить страницу`
        );
      }
      let result = await response.json();
      return result.items;
    } catch (error) {
      throw new Error(
        `Ошибка при получении данных. Попробуйте перезагрузить страницу`
      );
    }
  }
}

//Изменения поля ввода

async function inputChange() {
  try {
    repos = await getResponse();
    if (!repos.length) {
      throw new Error("Не найден репозиторий. Попробуте изменить имя");
    }
    if (containerForm.contains(autoComplete)) {
      clearAutoComplete(autoComplete);
      clearMessage();
      autoComplete = createElements();
      containerForm.append(autoComplete);
    } else if (!containerForm.contains(autoComplete)) {
      clearMessage();
      autoComplete = createElements();
      containerForm.append(autoComplete);
    }
  } catch (error) {
    clearAutoComplete(autoComplete);
    createMessage(error.message);
  }
  if (!input.value.trim()) {
    clearAutoComplete(autoComplete);
    clearMessage();
  }
}

//Создание автокомплита

function createElements() {
  let autoComplete = document.createElement("div");
  autoComplete.classList.add("autoComplete");
  repos.forEach((repo) => {
    const item = document.createElement("div");
    item.classList.add("autoComplete-item");
    item.textContent = repo.name;
    autoComplete.append(item);
    autoComplete.addEventListener("click", toSelectRepo);
  });
  return autoComplete;
}

//Показ сообщения об ошибке

function createMessage(text) {
  message.classList.remove("hidden");
  message.classList.add("message");
  message.textContent = text;
}

//Удаление сообщения об ошибке

function clearMessage() {
  message.classList.remove("message");
  message.classList.add("hidden");
  message.textContent = "";
}

//Удаление автокомплита

function clearAutoComplete(item) {
  item.removeEventListener("click", toSelectRepo);
  item.remove();
}

//Добавление выбранного репозитория в список

function toSelectRepo(event) {
  let selectedRepo = document.createElement("div");
  let selectedRepoInfo = document.createElement("div");
  let selectedRepoButton = document.createElement("button");
  selectedRepo.classList.add("selectedRepo");
  selectedRepoInfo.classList.add("selectedRepo-info");
  selectedRepoButton.classList.add("selectedRepo-button");
  repos.forEach((repo) => {
    if (repo.name === event.target.textContent) {
      selectedRepoInfo.innerHTML = `
          <div>name: ${repo.name}</div> 
          <div>owner: ${repo.owner.login}</div>
          <div>stars: ${repo.stargazers_count}</div>`;
    }
  });
  selectedRepo.append(selectedRepoInfo);
  selectedRepo.append(selectedRepoButton);
  containerRepo.append(selectedRepo);
  submitForm(event);
}

//Удаление выбранного репозитория из списка

function toClearRepo(item) {
  item.remove();
}
