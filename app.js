const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const {
    youdao,
    baidu,
    google
} = require('translation.js');
const token = '';
//括號裡面的內容需要改為在第5步獲得的Token
const bot = new TelegramBot(token, {
    polling: true
});
//使用Long Polling的方式與Telegram伺服器建立連線

let memberList = [
    "JJ",
    "Jacky",
    "Paltis",
    "Tina",
    "Rita",
    "Evan",
    "A-do 阿度",
    "Peter",
    "Amber",
    "Linda",
    "Carol",
    "Will",
    "Table",
    // "Hugo",
    // "Roger",
    // "Lytal",
    "Suna",
    "Luna",
    "Nancy",
    "Book",
    "Anya",
    "Yesno",
    "Alice",
];

//收到Start訊息時會觸發這段程式
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const resp = `
/list 顯示目前名單
/add [name ...] 增加人員
/remove [name ...] 刪除人員
/clear 刪除全部
/random [n lang] 隨機 n 位倒垃圾

其他
/cal [a+b] 計算機
/translate 翻譯(目前只有英翻中)
/lang 列出可用語系
/delay [n] 測試 delay
    `;
    bot.sendMessage(chatId, resp);
});

bot.onText(/\/cal (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    console.log('msg', msg);
    console.log('match', match);
    let resp = match[1].replace(/[^-()\d/*+.]/g, '');
    resp = '計算結果為: ' + eval(resp);
    bot.sendMessage(chatId, resp).then((msg) => {});
});


bot.onText(/\/lang/, function onListText(msg) {
    const chatId = msg.chat.id;
    const send = `
zh-Hans 簡體中文
zh-Hans-CN 大陸地區使用的簡體中文
zh-Hans-HK 香港地區使用的簡體中文
zh-Hans-MO 澳門使用的簡體中文
zh-Hans-SG 新加坡使用的簡體中文
zh-Hans-TW 臺灣使用的簡體中文
zh-Hant 繁體中文
zh-Hant-CN 大陸地區使用的繁體中文
zh-Hant-HK 香港地區使用的繁體中文
zh-Hant-MO 澳門使用的繁體中文
zh-Hant-SG 新加坡使用的繁體中文
zh-Hant-TW 臺灣使用的繁體中文
其他舊式用法，PS：不符合 RFC 4646 規範
zh-hakka 客家話
zh-cmn 普通話
zh-cmn-Hans 簡體普通話
zh-cmn-Hant 繁體普通話
zh-gan 江西話
zh-guoyu 國語
zh-min 福建話
zh-min-nan 閩南話
zh-wuu 吳語（上海話）
zh-xiang 湖南話
zh-yue 粵語`;
    bot.sendMessage(chatId, send);
});


// Matches /list
bot.onText(/\/list/, function onListText(msg) {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, [`目前名單: ${memberList.length} 位`, ...memberList].join('\n'));
});

bot.onText(/\/add (.+)/, function onAddListText(msg, match) {
    const chatId = msg.chat.id;
    const para = match[1].split(' ');
    memberList.push(...para);
    bot.sendMessage(chatId, [`新增 ${para.length} 位`, ...para].join('\n'));
});

function removeElement(array, elem) {
    var index = array.indexOf(elem);
    if (index > -1) {
        array.splice(index, 1);
    }
}

bot.onText(/\/remove (.+)/, function onRemoveListText(msg, match) {
    const chatId = msg.chat.id;
    const para = match[1].split(' ');
    para.forEach(element => {
        removeElement(memberList, element);
    });
    bot.sendMessage(chatId, [`刪除 ${para.length} 位`, ...para].join('\n'));
});

bot.onText(/\/clear/, function onClearListText(msg) {
    const chatId = msg.chat.id;
    memberList = [];
    bot.sendMessage(chatId, '已清空名單');
});


const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

bot.onText(/\/delay (.+)/, function onDelayText(msg, match) {
    const chatId = msg.chat.id;
    let delaySec = Number.parseInt(match[1]) || 1;
    bot.sendMessage(chatId, `start delay ${delaySec} sec ...`)
        .then(async (myMsg) => {
            const editOpts = {
                chat_id: myMsg.chat.id,
                message_id: myMsg.message_id,
            };
            do {
                await delay(1000);
                bot.editMessageText(`delay ${delaySec} sec ...`, editOpts);
            } while ((--delaySec) > 0);
            bot.editMessageText('end delay !', editOpts);
        });
});

function random(arr, n) {
    const shuffled = arr.sort(() => {
        return 0.5 - Math.random();
    });
    return shuffled.slice(0, n);
}

bot.onText(/\/random (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const para = match[1].split(' ');
    const num = Number.parseInt(para[0]) || 1;
    const lang = para[1] || 'zh-TW';
    const randomList = random(memberList, num);
    const send = randomList.length > 1 ?
        `恭喜 \n${randomList.map(str => `【${str}】,\n`).join('')} 以上 ${randomList.length} 位, 請倒垃圾` :
        `恭喜【${randomList.join(' ,\n')}】單兵, 請倒垃圾`;
    console.log(send);
    const audioOptions = {
        text: send,
        from: lang,
        com: true,
    };
    google.audio(audioOptions)
        .then(result => {
            const sendAudioOptions = {
                performer: '請去',
                title: '倒垃圾',
                caption: send,
            };
            bot.sendAudio(msg.chat.id, request(result), sendAudioOptions);
        })
        .catch(error => {
            console.log('[error]', error.code);
            bot.sendMessage(chatId, send);
        });
});


// Matches /photo
bot.onText(/\/photo/, function onPhotoText(msg) {
    // From file path
    const photo = `${__dirname}/../test/data/photo.gif`;
    bot.sendPhoto(msg.chat.id, photo, {
        caption: "I'm a bot!"
    });
});


// Matches /audio
bot.onText(/\/audio/, function onAudioText(msg) {
    // From HTTP request
    const url = 'https://translate.google.cn/translate_tts?ie=UTF-8&q=pig&tl=en&total=1&idx=0&textlen=3&tk=535602.953107&client=webapp&prev=input';
    const audio = request(url);
    bot.sendAudio(msg.chat.id, audio);
});


// Matches /love
bot.onText(/\/love/, function onLoveText(msg) {
    const opts = {
        reply_to_message_id: msg.message_id,
        reply_markup: JSON.stringify({
            keyboard: [
                ['Yes, you are the bot of my life ❤'],
                ['No, sorry there is another one...']
            ]
        })
    };
    bot.sendMessage(msg.chat.id, 'Do you love me?', opts);
});


// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function onEchoText(msg, match) {
    const resp = match[1];
    bot.sendMessage(msg.chat.id, resp);
});


// Matches /echo [whatever]
bot.onText(/\/translate (.+)/, function onTranslateText(msg, match) {
    const resp = match[1];
    const options = {
        text: resp,
        from: 'en',
        to: 'zh-TW'
    };
    // @linkDoc https://github.com/Selection-Translator/translation.js/
    google.translate(options)
        .then(result => {
            console.log(result); // result 的数据结构见下文\
            const resultStr = result.result.pop();
            bot.sendMessage(msg.chat.id, resultStr);
            const audioOptions = {
                text: resultStr,
                from: 'zh-TW',
            };
            return google.audio(audioOptions);
        })
        .then(result => {
            console.log('result', result);
            bot.sendAudio(msg.chat.id, request(result));
        });
});

// Matches /editable
bot.onText(/\/editable/, function onEditableText(msg) {
    const opts = {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Edit Text',
                    // we shall check for this value when we listen
                    // for "callback_query"
                    callback_data: 'edit'
                }]
            ]
        }
    };
    bot.sendMessage(msg.from.id, 'Original Text', opts);
});


// Handle callback queries
bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
    };
    let text;

    if (action === 'edit') {
        text = 'Edited Text';
    }

    bot.editMessageText(text, opts);
});