start_url = 'https://legionfarm.com/admin/login'; // Странаица входа

// Ждем загрузки popup-окна и вешаем обработчик на кнопку запуска бота:

window.addEventListener('load', function() {
	document.querySelector('button').addEventListener('click', start);
});

// Функция для перехода на страницу заупска бота с одновременным закрытием лишних окон:

function start() {
	chrome.tabs.update({url: 'icon.png'});
	setTimeout(function() {
		chrome.tabs.update({url: start_url});
		chrome.tabs.query({active: false}, function (tabs) {
			for (var i = 0; i < tabs.length; i++) {
				chrome.tabs.remove(tabs[i].id);
			}
		});
		window.close();
	}, 500);
}