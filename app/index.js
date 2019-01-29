import 'styles/index.less';

// ================================
// START YOUR APP HERE
// ================================

import topTemplate from 'top.ejs';
import itemViewByListTemplate from 'itemViewByList.ejs';
import itemViewByCardTemplate from 'itemViewByCard.ejs';
import listItemContainerTemplate from 'listItemContainer.ejs';
import cardItemContainerTemplate from 'cardItemContainer.ejs';
import loadingTemplate from 'loading.ejs';
import listCardButtonTemplate from 'listCardButton.ejs';
import topScrollBtnTemplate from 'topScrollBtn.ejs';

import Gorilla from '../Gorilla';

const top = new Gorilla.Component(topTemplate, {
  name : "BANANA BOOKSTORE"
});

top.reset = function() {
  document.querySelector("#container").innerText = "";
  document.querySelector("#keyword").value = "";
}

Gorilla.renderToDOM(
  top,
  document.querySelector("#storeName")
);

let indexToSearchBook = 1;
function loadBookList() {
  const btn = document.querySelector("#btn");
  const input = document.querySelector("#keyword");
  const container = document.querySelector("#container");

  btn.addEventListener("click", function(e) {
    e.preventDefault();
    container.innerHTML = "";
    const bookKeyword = input.value;
    seeMoreFlag = false;
    
    const loading = new Gorilla.Component(loadingTemplate, {
      name : `${bookKeyword}`
    });

    Gorilla.renderToDOM(
      loading,
      document.querySelector("#container")
    );

    const requestBook = new XMLHttpRequest();
    requestBook.onreadystatechange = function() {
      if(requestBook.readyState === 4 && requestBook.status === 200) {
        const data = JSON.parse(requestBook.responseText);
        let bookContainer = data.items;
        if(!bookContainer.length) {
          setTimeout(function() {
            container.innerHTML = "검색결과가 없습니다.";
            if(!seeMoreFlag) {
              cardItemContainer.on('AFTER_RENDER', function() {
                loading.destroy();
              });
            }
          }, 2200);
        } else {
          makeList(bookContainer, loading);
        }
      }
    };

    requestBook.open("GET", `http://localhost:3000/v1/search/book?query=${bookKeyword}&display=20&start=${indexToSearchBook}`);
    requestBook.send();
  });
};
loadBookList();

function makeList(bookContainer, loading) {
  let bookInformationObj = {};
  let countURL = 0;

  function makeShortenURL() {
    const requestURL = new XMLHttpRequest();
    requestURL.onreadystatechange = function() {
      if(requestURL.readyState === 4 && requestURL.status === 200) {
        const urlData = JSON.parse(this.responseText);
        
        if(countURL === bookContainer.length - 1) {
          bookContainer[countURL].link = urlData.result.url;
          render(bookContainer, bookInformationObj, loading);
        } else {
          bookContainer[countURL].link = urlData.result.url;
          countURL++;
          makeShortenURL(bookContainer, countURL);
        }
      }
    }
    requestURL.open("GET", `http://localhost:3000/v1/util/shorturl?url=${bookContainer[countURL].link}`);
    requestURL.send();
  }
  makeShortenURL(bookContainer, countURL);
}

let thisIsListView = true;
function render(bookContainer, bookInformationObj, loading) {
  if(thisIsListView) {
    for(let i = 0; i < bookContainer.length; i++) {
      bookInformationObj["check" + (i + 1)] = new Gorilla.Component(itemViewByListTemplate, {
        image : `${bookContainer[i].image}`,
        title : `${bookContainer[i].title}`,
        author : `${bookContainer[i].author}`,
        publisher : `${bookContainer[i].publisher}`,
        pubdate : `${bookContainer[i].pubdate.slice(0, 4) + "년" + bookContainer[i].pubdate.slice(4, 6) + "월" + bookContainer[i].pubdate.slice(-2) + "일"}`,
        description : `${bookContainer[i].description.slice(0, 50) + " .."}`,
        urlLink : `${bookContainer[i].link}`
      });
    }

    const listItemContainer = new Gorilla.Component(listItemContainerTemplate, {}, bookInformationObj);

    if(!seeMoreFlag) {
      listItemContainer.on('AFTER_RENDER', function() {
        loading.destroy();
      });
    }

    Gorilla.renderToDOM(
      listItemContainer,
      document.querySelector("#container")
    );
    setTimeout(function() {
      isLoading = false;
    }, 0);
  } else {
    for(let i = 0;  i < bookContainer.length; i++) {
      bookInformationObj["check" + (i + 1)] = new Gorilla.Component(itemViewByCardTemplate, {
        image : `${bookContainer[i].image}`,
        title : `${bookContainer[i].title.slice(0, 50)}`,
        author : `${bookContainer[i].author}`,
        publisher : `${bookContainer[i].publisher}`,
        pubdate : `${bookContainer[i].pubdate.slice(0, 4) + "년" + bookContainer[i].pubdate.slice(4, 6) + "월" + bookContainer[i].pubdate.slice(-2) + "일"}`,
        description : `${bookContainer[i].description.slice(0, 50) + " .."}`,
        urlLink : `${bookContainer[i].link}`
      });
    }

    const cardItemContainer = new Gorilla.Component(cardItemContainerTemplate, {}, bookInformationObj);

    if(!seeMoreFlag) {
      cardItemContainer.on('AFTER_RENDER', function() {
        loading.destroy();
      });
    }

    Gorilla.renderToDOM(
      cardItemContainer,
      document.querySelector("#container")
    );
    setTimeout(function() {
      isLoading = false;
    }, 0);
  }
}

const body = document.querySelector("body");
let seeMoreFlag = false;
function seeMore() {
  const input = document.querySelector("#keyword");
  indexToSearchBook += 20;
  const bookKeyword = input.value;
  seeMoreFlag = true;

  const requestBook = new XMLHttpRequest();
  requestBook.onreadystatechange = function() {
    if(requestBook.readyState === 4 && requestBook.status === 200) {
      const data = JSON.parse(requestBook.responseText);
      let bookContainer = data.items;
      makeList(bookContainer);
    }
  };

  requestBook.open("GET", `http://localhost:3000/v1/search/book?query=${bookKeyword}&display=20&start=${indexToSearchBook}`);
  requestBook.send();
  if(!thisIsListView) {
    const fatherUl = document.querySelectorAll(".fatherUl");
    fatherUl.forEach(function(fatherUl) {
      fatherUl.classList.add("flexUl");
    });
  }
}

let isLoading = false;
body.addEventListener('scroll', function() {
  if (body.scrollTop + body.clientHeight >= body.scrollHeight - 1) {
    if(!isLoading) {
      isLoading = true;
      seeMore();
    }
  }
});

function listAndCardButton() {
  const listCardButton = new Gorilla.Component(listCardButtonTemplate);

  listCardButton.listClick = function() {
    thisIsListView = true;
    const individualList = document.querySelectorAll(".individualList-card");
    const fatherUl = document.querySelectorAll(".fatherUl");
    const info = document.querySelectorAll(".info-card");
    const description = document.querySelectorAll(".description-card");
    const urlComponent = document.querySelectorAll(".urlComponent-card");
    const bookImage = document.querySelectorAll(".bookImage-card");

    individualList.forEach(function(e) {
      e.classList.add("individualList");
      e.classList.remove("individualList-card");
    });

    fatherUl.forEach(function(fatherUl) {
      fatherUl.classList.remove("flexUl");
    });

    info.forEach(function(e) {
      e.classList.add("info");
      e.classList.remove("info-card");
    });

    description.forEach(function(e) {
      e.classList.add("description");
      e.classList.remove("description-card");
    });

    urlComponent.forEach(function(e) {
      e.classList.add("urlComponent");
      e.classList.remove("urlComponent-card");
    });

    bookImage.forEach(function(e) {
      e.classList.add("bookImage");
      e.classList.remove("bookImage-card");
    });
  }

  listCardButton.cardClick = function() {
    thisIsListView = false;
    const individualList = document.querySelectorAll(".individualList");
    const fatherUl = document.querySelectorAll(".fatherUl");
    const info = document.querySelectorAll(".info");
    const description = document.querySelectorAll(".description");
    const urlComponent = document.querySelectorAll(".urlComponent");
    const bookImage = document.querySelectorAll(".bookImage");

    individualList.forEach(function(e) {
      e.classList.add("individualList-card");
      e.classList.remove("individualList");
    });

    fatherUl.forEach(function(fatherUl) {
      fatherUl.classList.add("flexUl");
    });

    info.forEach(function(e) {
      e.classList.add("info-card");
      e.classList.remove("info");
    });

    description.forEach(function(e) {
      e.classList.add("description-card");
      e.classList.remove("description");
    });

    urlComponent.forEach(function(e) {
      e.classList.add("urlComponent-card");
      e.classList.remove("urlComponent");
    });

    bookImage.forEach(function(e) {
      e.classList.add("bookImage-card");
      e.classList.remove("bookImage");
    });
  }

  Gorilla.renderToDOM(
    listCardButton,
    document.querySelector("#listAndCard")
  );
}
listAndCardButton();

const topScrollBtn = new Gorilla.Component(topScrollBtnTemplate);

topScrollBtn.clickTopScroll = function() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

Gorilla.renderToDOM(
  topScrollBtn,
  document.querySelector("#listAndCard")
);
