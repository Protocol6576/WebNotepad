// Глобальные переменные 

var myData = [ // Нужно для проверки работоспособности списка. ToDo: Удалить в итоговом варианте
    {
        title: 'Заметка №1',
        rank: '1',
    },
    {
        title: 'Заметка №2',
        rank: '2',
    },
    {
        title: 'Заметка №3',
        rank: '3',
    }
]

var autosave_timerId = 1;
var autosave_eventId = 1;
var current_note_History = '';



// ToDo: Сделай чтото с этим..
function getData() {
    webix.ajax().get('api/env/getData').then(function(data){
        data = data.text();
        data = Number(data);

        $$("NoteTextArea").define("attributes", { maxlength: data });
        $$("NoteTextArea").refresh();
    });
};

// ToDo: Сделай чтото с этим..
function setData(noteMaxLength) {
    webix.ajax().get('api/env/setData/' + noteMaxLength).then(function(data){
        getData();
    });
};

// *** Функции по обращению к серверу ***

function loadNoteHistoryList(noteName) {
    $$("NotesHistoryList").clearAll(); // ToDo: Заменить на аргумент в функции load (Который true)
    $$("NotesHistoryList").load(function() {
        return webix.ajax().get('api/note/history/getTitles/' + noteName);
    });
}

function showHistoryContent(noteName, historyName) { // ToDo: Повторяется код с showNoteContent, попробовать объеденить
    //$$("NoteTextArea").blockEvent(); // ToDo: Разобраться нужно ли, и удалить если будет не нужно
    $$("NoteTextArea").disable();
    $$("NoteTextArea").setValue(' ');

    $$("NoteTextArea").showProgress({
        type: "icon",
        delay: 500,
        hide: true
    });

    webix.ajax().get('api/note/history/showContent/' + noteName + '/' + historyName).then(function(data) {
        data = data.text();

        $$("NoteTextArea").setValue(data);
        $$("NoteTextArea").enable();
        $$("NoteTextArea").focus();
        //$$("NoteTextArea").unblockEvent(); // Если перенести ниже (вне границы .then) то .setValue происходит уже после .unblockEvent, почему-то. ToDo: Разобраться почему
    });

}

function loadNoteList() {
    $$("NotesList").clearAll(); // ToDo: Заменить на аргумент в функции load (Который true)
    $$("NotesList").load(function() {
        return webix.ajax().get('api/note/getTitles');
    });
    disableTextarea();  // И почему оно блин тут?
                        // ToDo: А может оно нужно?
}

function redactNoteContent(noteName, newText) {
    var reqResult = webix.ajax().get('api/note/redactContent/' + noteName + '/' + newText);

    if(reqResult) {
        webix.message('Текст заметки изменен');
    } else {
        webix.message('Произошла ошибка, повторите позже');
    }

}

function showNoteContent(noteName) {

    //$$("NoteTextArea").blockEvent(); // ToDo: Разобраться нужно ли, и удалить если будет не нужно
    $$("NoteTextArea").disable();
    $$("NoteTextArea").setValue(' ');

    $$("NoteTextArea").showProgress({
        type: "icon",
        delay: 500,
        hide: true
    });

    webix.ajax().get('api/note/showContent/' + noteName).then(function(data) {
        data = data.text();

        $$("NoteTextArea").setValue(data);
        $$("NoteTextArea").enable();
        $$("NoteTextArea").focus();
        //$$("NoteTextArea").unblockEvent(); // Если перенести ниже (вне границы .then) то .setValue происходит уже после .unblockEvent, почему-то. ToDo: Разобраться почему
    });

}

function renameNote(noteName, newNoteName, noteId) {
    var reqResult = webix.ajax().get('api/note/rename/' + noteName + '/' + newNoteName);

    if(reqResult) {
        var renameNote = $$("NotesList").getItem(noteId);
        renameNote.title = newNoteName;
        $$("NotesList").updateItem(noteId, renameNote);

        webix.message('Заметка переименована');
    } else {
        webix.message('Произошла ошибка, повторите позже');
    }
}

function createNote(newNoteName) {
    var reqResult = webix.ajax().get('api/note/create/' + newNoteName);

    if(reqResult) {
        let newNote = {
            rank: "|",
            title: newNoteName
        };
        $$("NotesList").add(newNote);
        webix.message('Заметка создана');
    } else {
        webix.message('Произошла ошибка, повторите позже');
    }
}

function deleteNote(noteName, noteId) {
    var reqResult = webix.ajax().get('api/note/delete/' + noteName).then(function(data) {
        data = data.json();

        webix.message(data);
    });

    if(reqResult) {
        $$("NotesList").remove(noteId);
        webix.message('Заметка удалена');
    } else {
        webix.message('Произошла ошибка, повторите позже');
    }
}

// ** Остальные функции **

function disableTextarea() { // "Разобраться почему всегда == 0" - потому что при возврате false в контроллере все крашится. ToDo: Разобраться. А также посмотреть про overlay Box
    var notesCount = $$("NotesList").count();

    $$("NoteTextArea").disable();
    if(notesCount == 0) {
        $$("NoteTextArea").setValue('Создайте заметку');
    } else {
        $$("NoteTextArea").setValue('Выберите заметку');
    }
}

function autosave_set(autosave_value) {
    if(autosave_value) {
        autosave_eventId = $$("NoteTextArea").attachEvent("onKeyPress", function() {
            clearTimeout(autosave_timerId);
            var itemId = $$("NotesList").getSelectedItem().title; // ToDo: Изменить (выглядит ужасно)
            var newText = $$("NoteTextArea").getValue();
    
            autosave_timerId = setTimeout(redactNoteContent, 3000, itemId, newText);
        });
    } else {
        $$("NoteTextArea").detachEvent(autosave_eventId);
    }
}

function showMessage(text) { // ToDo: Удалить в итоговом варианте 
    webix.message(text);
}





webix.ready(function(){
    webix.ui({
        rows: [
            {
                cols: [
                    {
                        // Меню слева
                        width: 300,
                        type: 'clean',

                        rows: [
                            {
                                view:"toolbar",
                                id:"mainToolbar",
                                height: 40,
                                type: 'clean',

                                cols: [
                                    {
                                        view: 'icon',
                                        icon: 'wxi-dots',
                                        click: function(){
                                            if( $$("menu").config.hidden) {
                                                $$("menu").show();
                                            } else {
                                                $$("menu").hide();
                                            }
                                        }
                                    },
                                    {
                                        view:'search',
                                        id: 'NotesList_input',

                                        placeholder: 'Найти...',
                                    }
                                ]
                            },
                            {
                                view: 'list',
                                id: 'NotesList',
                                data: ' ', // НЕ УДАЛЯТЬ! Иначе не произайдет прогрузки
                                            // Я глупый или да? Все и так работает без этого. ToDo: Проверить

                                select: true,
                                drag: true,
                                scroll: 'auto',
                                template:"#rank#. #title# <span class='webix_icon mdi mdi-close remove-icon' title='Remove'></span>",

                                onContext:{}, // Позволяет использовать свое контекстное меню
                                onClick:{
                                    "remove-icon": function(ev, id){
                                        $$("NotesList").remove(id);
                                    }
                                }
                            },

                        ]
                    },
                    {
                        // Текстовое поле справа
                        rows: [
                            {
                                view:"toolbar",
                                id:"currNoteToolbar",
                                cols: [
                                    {
                                        
                                    },
                                    {
                                      view: 'checkbox',
                                      id: 'autosave_checkbox',
                                      label: 'Автосохранение',
                                      value: '0',
                                      labelWidth: 120,
                                      width: 150
                                    },
                                    {
                                        // Загрузить данные
                                        view: 'icon',
                                        icon: 'wxi-file',
                                        click: function() {
                                            var itemId = $$("NotesList").getSelectedItem().title; // "Изменить (выглядит ужасно)" - а разве это так? ToDo: Подумать на этим
                                            var newText = $$("NoteTextArea").getValue();
                                            redactNoteContent(itemId, newText);
                                        },
                                    }
                                ]
                                
                            },
                            {
                                view: 'textarea', // ToDo: Убрать блин эти бортики! БЕСЯТ!!
                                id: 'NoteTextArea',
                                placeholder: 'Напишите что-то здесь',

                                attributes: {
                                    maxlength: 1,
                                },
                                
                                css: {
                                    'border': 'none !important',
                                    'outline': 'none !important',
                                }
                            },                        
                        ]


                        
                    }
                ]
            }
        ]
    });



    // *** Дополнительные элементы интерфейса ***

    // Появление Прогрес-бара при (пере)загрузке
    webix.extend($$("NotesList"), webix.ProgressBar);
    $$("NotesList").showProgress({
        type: "top",
        delay:3000,
        hide:true
    });

    // Прогрес-бар (иконка) при обновлении компонента
    webix.extend($$("NoteTextArea"), webix.ProgressBar);

    // Контекстное меню для списка заметок
    webix.ui({ 
        view:"contextmenu",
        id:"cmenu",
        data: [
            "Переименовать",
            "Удалить",
            { $template:"Separator" },
            "История",
        ],

        on:{
            onItemClick: function(id) {
                var context = this.getContext();
                var list = context.obj;
                var itemId = context.id;
                var itemTitle = list.getItem(itemId).title;

                switch (id) {
                    case "Переименовать":
                        webix.prompt({
                            title:"Переименование заметки",
                            text:"Введите новое название заметки",
                            ok:"Переименовать",
                            cancel:"Отменить",
                            input:{
                              required:true,
                              placeholder:"Ваше название",
                              value: itemTitle
                            },
                            width: 350,
                        }).then(function(result){
                            renameNote(itemTitle, result, itemId);
                        });
                        break;
                    case "Удалить":

                        webix.confirm({
                            title:"Подтвердите действие",
                            ok:"Да", 
                            cancel:"Нет",
                            text:'Вы уверены что хотите удалить "' + itemTitle + '"?',
                        }).then(function(result){
                            deleteNote(itemTitle, itemId);
                        });
                        break;
                    case "История":
                        current_note_History = itemTitle;
                        loadNoteHistoryList(current_note_History)
                        $$('NotesHistoryWindow').show();
                        break;
                };
                
                //webix.message("List item: <i>"+itemId+"</i> <br/>Context menu item: <i>"+this.getItem(id).value+"</i>");
            }
        }
    });

    $$("cmenu").attachTo($$("NotesList"));

    // Меню с историей заметки
    webix.ui({
        view:"window",
        id:"NotesHistoryWindow",
        height:250,
        width:300,
        left:50, top:50,
        move:true,
        head:{
            view: 'toolbar',
            id: 'NotesHisoryWindowToolBar',
            cols: [
                {
                    width: 4,
                },
                {
                    view: 'label',
                    label: 'История заметки',
                },
                {
                    view: 'icon',
                    icon: 'wxi-close',
                    click: function() {
                        $$('NotesHistoryList').unselect();
                        $$('NotesHistoryWindow').hide();
                    }
                }
            ]
        },
        body:{
            view: 'list',
            id: 'NotesHistoryList',
            data: ' ', // НЕ УДАЛЯТЬ! Иначе не произайдет прогрузки
                        // Я глупый или да? Все и так работает без этого. ToDo: Проверить

            select: true,
            drag: true,
            scroll: 'auto',
            template:"#title#",
        }
    });

    // Боковое меню со всеми кнопками
    webix.ui({
        view: "sidemenu",
        id: "menu",
        width: 200,
        position: "left",
        body:{
            view: "list",
            id: "Sidemenu_list",
            borderless: true,
            scroll: false,
            template: "<span class='webix_icon mdi mdi-#icon#'></span> #value#",
            data: [
                {id: 1, value: "Новая заметка", icon: "plus-circle"},
                {id: 2, value: "Обновить список", icon: "reload"},
                {id: 3, value: "Настройки", icon: "cog"},
            ],
            select: true,
            type: {
                height: 40
            },

            on: {
                onItemClick: function(id) {
                    switch (id) {
                        case '1':
                            webix.prompt({
                                title:"Создание заметки",
                                text:"Введите название новой заметки",
                                ok:"Создать",
                                cancel:"Отменить",
                                input:{
                                required:true,
                                placeholder:"Ваше название",
                                },
                                width: 350,
                            }).then(function(result) {
                                createNote(result);
                            });
                            break;

                        case '2':
                            loadNoteList();
                            break;

                        case '3':
                            webix.prompt({
                                title:"Изменение длины заметки",
                                text:"Введите новое значение длины заметки",
                                ok:"Изменить",
                                cancel:"Отменить",
                                input:{
                                required:true,
                                placeholder:"Ваша длина",
                                },
                                width: 350,
                            }).then(function(result) {
                                setData(result);
                            });
                            break;
                    };

                    $$("menu").hide();
                }
            }
        }
    });



    // *** События ***

    // Фильтрация списка заметок
    $$("NotesList_input").attachEvent("onTimedKeyPress", function() {
        var value = this.getValue().toLowerCase();
        $$("NotesList").filter(function(obj){
          return obj.title.toLowerCase().indexOf(value) !== -1;
        })
    });

    // Загрузка текста из заметки
    $$("NotesList").attachEvent("onSelectChange", function() {

        if($$("NotesList").getSelectedId()) {
            var itemId = $$("NotesList").getSelectedItem().title; // Изменить (выглядит ужасно)
            showNoteContent(itemId);
        } else {
            disableTextarea();
        }
        
    });

    // Загрузка текста из истории
    $$("NotesHistoryList").attachEvent("onSelectChange", function() {

        if($$("NotesHistoryList").getSelectedId()) {
            var itemId = $$("NotesHistoryList").getSelectedItem().title; // Изменить (выглядит ужасно)
            showHistoryContent(current_note_History, itemId);
        }
        
    });

    // Выбор автосейва (Включение-выключение)
    $$("autosave_checkbox").attachEvent("onChange", function(newValue, oldValue){
        autosave_set(newValue);
    });


    
    // *** Функциии после инициализации ***

    loadNoteList();
    getData(); // "разобратсья почему не запускается" - Не работает из-за $$("NoteTextArea").attachEvent("onChange") ToDo: Разобраться почему

});