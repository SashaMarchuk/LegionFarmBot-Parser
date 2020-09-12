// Логин и пароль для входа на сайт:

login = 'radix@legionfarm.com';
password = 'W5_1SfZE9NWoXrt';

// Интверал обновления:

interval = 30; // В секундах

// Токен для Телеграм:

token = '1372734418:AAHuDdQGLxPjdJTpsqnwFHRKI6yTyMc2SYk';

// Чат в который должны падать уведомления:

chat = '-1001414148877'; // Важно! Бот должен состоять в чате, иначе сообщений отправлятся не будут!

detect(); // Запускаем детектор страниц

// Функция для определения текущей страницы и необходимых действий:

function detect() {
	
	// Если это страница авторизации, то запускаем функцию для авторизации:
	
	if (location.href == 'https://legionfarm.com/admin/login') {
		
		authorization();
		
	}
	
	// Если это страница с заказами, то запускаем функцию для парсинга пагинатора:
	
	else if (location.href == 'https://legionfarm.com/admin/booster-area/new-deals') {
		
		msg('Ожидайте, идёт парсинг информации...');
		parse_pagination();
		
	}
	
	// Если это любая другая страница, то переходим к странице авторизации:
	
	else {
		
		location.href = 'https://legionfarm.com/admin/login';
		
	}
	
}

// Функция для авторизации на сайте:

function authorization() {
	
	// Вводим логин и пароль в форму:
	
	$('input#loginform-email').val(login);
	$('input#loginform-password').val(password);
	
	// Немного выжидаем, чтобы с гарантией
	// успел подгрузтися токен от Google:
	
	setTimeout(function() {
		$('button[type="submit"]').click(); // Жмем вход
	}, 3000);
	
}

// Функция для парсинга пагинатора:

function parse_pagination() {
	
	// Ищем ссылки в пагинаторе:
	
	var page = $('ul.pagination > li:not(.prev, .next) > a');
	
	var link = []; // Создаем пустой массив для записи ссылок
	
	// Если в пагинаторе есть хотя бы одна ссылка,
	// то обходим в цикле все имеющиеся ссылки
	// и сохраняем их в пустой массив link:
	
	if (page.length > 0) {
		
		page.each(function(index, element) {
			link.push(element.href);
		});
		
	}
	
	// Если в пагинаторе вообще нет ссылок,
	// то записываем в пустой массив link
	// только адрес текущей страницы:
	
	else {
		
		link.push(location.href);
		
	}
	
	
	// Выводим в косноли сколько ссылок нашли:
	
	console.log('Найдено ссылок для парсинга: ' + link.length + ' шт.');
	
	buffer = Object.create(null); // Создаем пустой объект ддя записи результатов парсинга
	
	parser(link); // Отправляем массив ссылок на парсинг
	
}

// Функция для пасринга таблицы с заказами:

function parser(link) {
	
	// Если в массиве есть хотя бы одна ссылка:
	
	if (link.length > 0) {
		
		// То делаем запрос по самой первой ссылке:
		
		console.log("Запрашиваем содержимое:\n" + link[0]);
		
		
		jQuery.ajax({
			url: link[0],
			method: 'GET',
			cache: false,
			dataType: 'html',
			success: function(html){
				
				// Ищем таблицы:
				
				var doc = new DOMParser().parseFromString(html, "text/html");
				var table = $('table.table:eq(0)', doc);
				
				// Если найдена хотя бы одна таблица
				// с классом .table, то парсим с него инфу:
				
				if (table.length > 0) {
					
					// Вытаскиваем заголовки:
					
					var th = table.find('th');
					var title = [];
					th.each(function(index, element) {
						if (index === 1) {
							title.push('Accept');
						}
						else {
							title.push(element.innerText);
						}
					});
					
					// Вытаскиваем данные с ячеек:
					
					var tr = table.find('tr[data-key]');
					tr.each(function(index, element) {
						accept_link = $('a.btn-success', element);
						if (accept_link.length > 0) {
							var td = $('td', element);
							var obj = Object.create(null);
							td.each(function(i, e) {
								if (i === 1) {
									obj[title[i]] = accept_link[0].href;
								}
								else if (i > 1) {
									obj[title[i]] = e.innerText.trim();
								}
							});
							if (obj['Affiliation'] == 'PC') {
								var key = Number(element.getAttribute('data-key'));
								buffer[key] = obj;
							}
						}
					});
					
				}
				
				// Удаляем спасрсенню ссылку из массива ссылок на прсинг
				// после чего вновь запуcкаем функцию для париснга:
				
				link.shift();
				parser(link);
				
			},
			error: function(obj) {
				console.log('При запросе ссылки произошла ошибка:');
				console.log(link[0]);
				console.dir(obj);
				console.log('Ждем секунду и повторяем попытку вновь');
				setTimeout(function() {
					parser(link);
				}, 1000);
			}
		});
		
	}
	
	// Если в массиве не осталось ни одной ссылки:
	
	else {
		
		console.log('Информация о заказах успешно спарсена');
		checking_orders(); // Выполняем проверку на наличие новых заказов
		
	}
	
}

// Функция для проверки наличия новых заказов:

function checking_orders() {
	
	// Если в буфере есть хотя бы один заказ:
	
	if (Object.keys(buffer).length > 0) {
		
		// Проверяем все заказы из буфера на новизну:
		
		localforage.getItem('orders', function(err, orders) {
			if (orders) {
				$.each(buffer, function(i, v) {
					if (typeof orders[i] == 'undefined') {
						orders[i] = buffer[i];
					}
					else {
						delete buffer[i];
					}
				});
				console.log('Найдено новых заказов: ' + Object.keys(buffer).length + ' шт.');
				localforage.setItem('orders', orders, function(e, v) {
					notify(); // Шлем уведомление
				});
			}
			else {
				localforage.setItem('orders', buffer, function(e, v) {
					msg('Похоже парсер запускается впервые, новых заказов пока нет.', interval);
				});
			}
		});
		
	}
	
	// Если в буфере ничего нет, выдаем ошибку:
	
	else {
		
		msg('В буфере отсутствуют заказы для проверки.<br>Свяжитесь с разработчиком для решения проблемы.', interval);
		
	}
	
}

// Функция для вывода сообщений:

function msg(text, timer) {
	
	$('body').css('overflow', 'hidden');
	
	var msg = $('#msg');
	
	if (typeof timer == 'undefined') {
		
		var html = '<div style="display: table; width: 100%; height: 100%;">'+
			'<div style="display: table-cell; vertical-align: middle; padding: 50px; text-align: center;">'+
				'<h1 style="line-height: 1.3;">'+text+'</h1>'+
			'</div>'+
		'</div>';
		
	}
	
	else {
		
		var html = '<div style="position: fixed; display: table; width: 100%; height: 100vh; top: 0; left:0;">'+
			'<div style="display: table-cell; vertical-align: middle; padding: 50px; text-align: center;">'+
				'<h1 style="line-height: 1.3;">'+text+'<br>Повторный парсинг будет осуществлен через <span id="timer">'+timer+'</span> секунд.</h1>'+
			'</div>'+
		'</div>';
		
		var update = setInterval(function() {
			if (timer > 0) {
				timer--;
				$('span#timer').html(timer);
				$('title').html(timer + ' сек. до обновления');
			}
			else {
				clearInterval(update);
				location.href = 'https://legionfarm.com/admin/login';
			}
		}, 1000);
		
	}
	
	if (msg.length) {
		
		$('div#msg').html(html);
		
	}
	
	else {
		
		var block = '<div id="msg" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #fff; z-index: 99999;">'+html+'</div>';
		$('body').append(block);
		
	}

}

// Функция ддя уведомдлений о новых заказах:

function notify() {
	
	// Если есть новые заказы:
	
	if (Object.keys(buffer).length) {
		
		console.log('Отправляем уведомление на телеграм');
		msg('Найдено новых заказов: ' + Object.keys(buffer).length + ' шт.<br>Отправляем уведомления на телеграм...', interval);
		buffer['token'] = token;
		buffer['chat'] = chat;
		chrome.extension.sendMessage(JSON.stringify(buffer));
		
	}
	
	// Если нет новых заказов:
	
	else {
		
		msg('На текущий момент новых заказов пока что нет.', interval);
		
	}
	
}