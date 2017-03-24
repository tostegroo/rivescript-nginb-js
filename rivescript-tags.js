/**
 * @param {Array}
 */
//{if gender=="male"}Vindo{else}Vinda{/if}

/**
 * demora o tempo (em segundos) para enviar a mensagem.
 * @param {number}, o numero de segundos para esperar e enviar a mensagem
 */
<delay 30>

/**
 * Representa um anexo ou mais anexos, podes er um vídeo/audio/imagem/localização
 * @param {array/string}, este parâmetro faz a chamada de um anexo ja configurado.
 */
<attachment ["nude", "posnude"]>
/** or */
<attachment posnude>

/**
 * Representa um menu quick reply do facebook.
 * @param {array}, este parâmetro é usado para fazer chamada direta de um ou mais aenxos. Neste caso se não houver texto, o titulo não será enviado.
 */
<attachment [
    {
        type: "image",
        url: "http://www.belasmensagens.com.br/wp-content/uploads/2014/03/frases-lindas.jpg"
    },
    {
        type: "image",
        url: "http://lh5.ggpht.com/-VmWNzewJSZ8/UbfFF1bKg0I/AAAAAAAASUE/HoM4dYA-RjQ/Lindas%252520fotos%252520da%252520chuva%252520%2525282%252529%25255B3%25255D.jpg?imgmax=800"
    }
]>
/**********************************************************************************************************************

/**
 * Executa uma ou mais ações.
 * @param {object/string}, este parâmetro faz a chamada de uma action ja configurada.
 */
<script ["function_name"]> or <js ["function_name"]>
/** or */
<script function_name> or <js function_name>

/**
 * Executa uma ou mais ações.
 * @param {array}, este parâmetro é usado para fazer chamada direta de acions. O texto é enviado ao facebook e a ação executada
 */
<script [
    {name: "pause", param:{name:"ok", title:"title"}},
    {name: "start"}
]>
/**********************************************************************************************************************


/**
 * Executa um update.
 * Para valores compostos dentro de um campo, ex({min:0, max:20, value:2}) pode-se usar "." para determinar filhos, ex: "health.min: "+3"
 * Para acrescentar, diminuir, multiplicar ou dividir valores numéricos, pode-se usar +, -, *, /.
 * @param {object}, um objeto de update com uma ou mais chaves para fazer update
 */
<update {
    tbl_character: {health: "+3", "sanity: "/2","hunger: "*2"},
    tbl_user: {email: "besta@gmail.com"}
}>
/**********************************************************************************************************************

/**
 * Condicional, se não atender as condições a linha não é enviada.
 * @param {string}, um string entre parenteses, com as condições (exatamente como em um if normal, mas pode usar & em vez de && e | em vez de ||)
 */
<if (health>5&sanity>3|stamina<3)>

/**
 * Condicional de parada, se não atender as condições nenhuma linha da sequencia é enviada.
 * @param {string}, um string entre parenteses, com as condições (exatamente como em um if normal, mas pode usar & em vez de && e | em vez de ||)
 */
<ifbreak (health>5&sanity>3|stamina<3)>

/**
 * Saves the line and pass as variable to be reused
 */
<save>

/**
 * Returns an empty string
 */
<nrsp>

/**
 * Condicional pode ser usado em botões de menu, se não atender as condições o botão não é renderizado
 * @key {key}, coloque uma chave com o nome if
 * @value {string}, um string entre parenteses, com as condições (exatamente como em um if normal, mas pode usar & em vez de && e | em vez de ||)
 */
if: "(first_name=="Fabio")"

/**********************************************************************************************************************

/**
 * Variável customizada para ser substituida após o rtorno do bot.
 * @param {value}, um string com o nome da variável (ps: ela deve existir no dataset enviado a função de substituição);
 */
<var first_name>
/**********************************************************************************************************************

/**
 * Faz uma chamada para o bot.
 * @param {string}, uma string para ser enviada ao bot
 */
<next cmdnext>
/* or */
<next "cmdnext">

/**
 * Faz uma ou mais chamadas de looping para o bot.
 * @param {array}, uma array de chamadas, que serão executadas na ordem.
 */
<next ["cmdnext", "cmddois"]>
/**********************************************************************************************************************

/**
 * Representa um menu quick reply do facebook. Se não houver texto, usará o texto do menu, caso contrário o da linha de texto
 * @param {string}, este parâmetro faz a chamada de um menu ja configurado.
 * @param {object/array} opcional, este parâmetro faz a chamada de parametros para os botoes do menu (implementado somente 1 ou 0) sendo que 1 nao mostra o botao
 */
<quickreply qr_menu [1, 0, 0]>

/**
 * Representa um menu quick reply do facebook. Se não houver texto, usará o texto do menu, caso contrário o da linha de texto
 * @param {object}, este parâmetro faz a chamada de uma função e envia o objeto como parametro.
 * @param {object/array} opcional, este parâmetro faz a chamada de parametros para os botoes do menu (implementado somente 1 ou 0) sendo que 1 nao mostra o botao
 */
<quickreply {facebook_id:"1234567891010"} [1, 0, 0]>

/**
 * Representa um menu quick reply do facebook.
 * @param {array}, este parâmetro é usado para fazer chamada direta dos botões. Neste caso se não houver texto, o titulo não será enviado.
 * @param {object/array} opcional, este parâmetro faz a chamada de parametros para os botoes do menu (implementado somente 1 ou 0) sendo que 1 nao mostra o botao
 */
<quickreply [
    {
        content_type: "text",
        title: "yes",
        payload: "yescmd"
    },
    {
        content_type: "text",
        title: "no",
        payload: "nocmd"
    }
] [1, 0]>
/* or */
<quickreply ["yes", "no", "maybe"] [1, 0, 0]> //if you only send an array of strings, all payloads will be cmdr (x) where x is the array index + 1
/**********************************************************************************************************************

/**
 * Representa um menu de botoes do facebook. Se não houver texto, usará o texto do menu, caso contrário o da linha de texto
 * @param {string}, este parâmetro faz a chamada de um menu ja configurado.
 * @param {object/array} opcional, este parâmetro faz a chamada de parametros para os botoes do menu (implementado somente 1 ou 0) sendo que 1 nao mostra o botao
 */
<button button_menu [1, 0, 0]>

/**
 * Representa um menu de botoes do facebook. Se não houver texto, usará o texto do menu, caso contrário o da linha de texto
 * @param {object}, este parâmetro faz a chamada de uma função e envia o objeto como parametro.
 * @param {object/array} opcional, este parâmetro faz a chamada de parametros para os botoes do menu (implementado somente 1 ou 0) sendo que 1 nao mostra o botao
 */
<button {facebook_id:"1234567890101"} [1, 0, 0]>

/**
 * Representa um menu de botoes do facebook.
 * @param {array}, este parâmetro é usado para fazer chamada direta dos botões. Neste caso se não houver texto , o  titulo não será enviado.
 * @param {object/array} opcional, este parâmetro faz a chamada de parametros para os botoes do menu (implementado somente 1 ou 0) sendo que 1 nao mostra o botao
 */
<button [
    {
        title: "Transferir",
        webview_height_ratio: "tall",
        messenger_extensions: true,
        url: "https://google.com.br"
    },
    {
        title: "Voar",
        payload: "cmdvoar"
    }
] [1, 0, 0]>
/* or */
<button ["yes", "no", "maybe"] [1, 0, 0]> //if you only send an array of strings, all payloads will be cmdr (x) where x is the array index + 1

/**********************************************************************************************************************

/**
 * Representa um menu de template do facebook. Se não houver texto, usará o texto do menu, caso contrário o da linha de texto
 * @param {object}, este parâmetro faz a chamada de um menu ja configurado.
 * @param {object/array} opcional, este parâmetro faz a chamada de parametros para os botoes do menu (implementado somente 1 ou 0) sendo que 1 nao mostra o botao
 */
<template template_menu [1, 0, 0]>

/**
 * Representa um menu de template do facebook. Se não houver texto, usará o texto do menu, caso contrário o da linha de texto
 * @param {object}, este parâmetro faz a chamada de uma função e envia o objeto como parametro.
 * @param {object/array} opcional, este parâmetro faz a chamada de parametros para os botoes do menu (implementado somente 1 ou 0) sendo que 1 nao mostra o botao
 */
<template {facebook_id:"1234567890101"} [1, 0, 0]>

/**
 * Representa um menu de template do facebook.
 * @param {array}, este parâmetro é usado para fazer chamada direta dos elementos do template. Se houver text ele será enviado antes do template.
 * @param {object/array} opcional, este parâmetro faz a chamada de parametros para os botoes do menu (implementado somente 1 ou 0) sendo que 1 nao mostra o botao
 */
<template [
    {
        title: "item 1",
        subtitle: "descrição do item 1",
        image_url: "imagem do item 1",
        buttons:
        [
            {
                title:"botao 1",
                webview_height_ratio: "tall",
                messenger_extensions: true,
                send_id: true,
                encode_id: true,
                url: "url"
            }
        ]
    },
    {
        title: "item 2",
        subtitle: "descrição do item 2",
        image_url: "imagem do item 2",
        buttons:
        [
            {
                title:"botao 2",
                payload: "cmdopen"
            }
        ]
    }
] [1, 0, 0]>
