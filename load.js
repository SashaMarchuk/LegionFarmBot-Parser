// По готовности страницы запускаем функцию для подгрузки библиотек:

document.addEventListener('DOMContentLoaded', function() {
	loader(1);
});

// Функция для ступенчатой загрузки необходимых для работы бота библиотек:

function loader(n) {
	
	setTimeout(function() {
		
		if (n === 1) {
			
			console.log('Начинаем загрузку кода библиотеки jQuery');
			var script_path = chrome.extension.getURL('jquery.js') + '?time=' + new Date().getTime();
			var xhr = new XMLHttpRequest(); xhr.open('GET', script_path);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === XMLHttpRequest.DONE) {
					if (xhr.status === 200) {
						console.log('Библиотека jQuery успешно загружена');
						window.eval(xhr.responseText);
						loader(2);
					}
					else {
						console.log('Не удалось загрузить библиотеку jQuery, повтореям попытку');
						loader(1);
					}
				}
			}
			xhr.send();
			
		}
		
		if (n === 2) {
			
			console.log('Начинаем загрузку кода библиотеки localForage');
			var script_path = chrome.extension.getURL('localforage.js') + '?time=' + new Date().getTime();
			var xhr = new XMLHttpRequest(); xhr.open('GET', script_path);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === XMLHttpRequest.DONE) {
					if (xhr.status === 200) {
						console.log('Библиотека localForage успешно загружена');
						window.eval(xhr.responseText);
						loader(3);
					}
					else {
						console.log('Не удалось загрузить библиотку localForage, повторяем попытку');
						loader(2);
					}
				}
			}
			xhr.send();
			
		}
		
		if (n === 3) {
			
			console.log('Начинаем загрузку кода нашего бота');
			var script_path = chrome.extension.getURL('bot.js') + '?time=' + new Date().getTime();
			var xhr = new XMLHttpRequest(); xhr.open('GET', script_path);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === XMLHttpRequest.DONE) {
					if (xhr.status === 200) {
						console.log('Код от бота успешно загружен');
						window.eval(xhr.responseText);
					}
					else {
						console.log('Не удалось загрузить кот от бота, повторяем попытку');
						loader(3);
					}
				}
			}
			xhr.send();
			
		}
		
	}, 200);
	
}