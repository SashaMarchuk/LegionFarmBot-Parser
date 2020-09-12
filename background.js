// Вешаем обработчик для отслеживания поступлений новых заказов:

chrome.extension.onMessage.addListener(function(json) {
	
	if (json.includes('token')) {
		
		signal.play();
		
		var bufer = JSON.parse(json);
		var token = bufer['token'];
		var chat = bufer['chat'];
		delete bufer['token'];
		delete bufer['chat'];
		
		var keys = Object.keys(bufer);
		
		for (var n = 0; n < keys.length; n++) {
			
			var text = "Найден новый заказ за номером <b>№" + keys[n] + "</b>\n\n";
			
			var title = Object.keys(bufer[keys[n]]);
			
			for (var z = 0; z < title.length; z++) {
				
				var txt = bufer[keys[n]][title[z]];
				
				txt = txt.replace("Order with a mandatory YouTube broadcast!", " Order with a mandatory YouTube broadcast!\n\n");
				txt = txt.replace('I do not understand what needs to be done', '');
				
				text += "<b>" + title[z] + "</b>: " + txt + "\n\n";
				
			}
			
			send_notify(text, chat, token);
			
		}
		
	}
});

// Функция для отправки уведомлений в телеграм:

function send_notify(text, chat, token) {
	
	var link = 'https://api.telegram.org/bot'+token+'/sendMessage?chat_id='+chat+'&parse_mode=HTML&text=' + encodeURIComponent(text);

	var xhr = new XMLHttpRequest(); xhr.open('GET', link);
	
	xhr.onreadystatechange = function() {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) {
				var obj = JSON.parse(xhr.responseText);
				if (obj.ok) {
					console.log('Уведомление успешно отправлено:');
				}
				else {
					console.log('При отправке уведомления произошла ошибка:');
				}
				console.dir(obj);
			}
			else {
				console.log('Ошибка отправки сообщения( Ждем секунду и повторяем попытку');
				setTimeout(function() {
					send_notify(text, chat, token);
				}, 1000);
			}
		}
	}
	
	xhr.send();

}

// Ссылка на звуковой сигнал:
signal = new Audio(chrome.extension.getURL('signal.mp3'));

// Ставим обработчики для отслеживания вкладок и установки запрета заморозки:

chrome.tabs.onCreated.addListener(function(tab) {
    chrome.tabs.update(tab.id, {
        autoDiscardable: false
    });
});

chrome.tabs.onReplaced.addListener(function(tabId) {
    chrome.tabs.update(tabId, {
        autoDiscardable: false
    });
});

chrome.runtime.onInstalled.addListener(function(details) {
    chrome.tabs.query({}, function(tabs) {
        tabs.forEach(function(tab) {
            chrome.tabs.update(tab.id, {
                autoDiscardable: false
            });
        });
    });
});