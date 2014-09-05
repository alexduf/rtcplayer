define(function(){
    var cookies;

    var readCookies = function readCookies(name){
        if(cookies){ return cookies[name]; }

        var c = document.cookie.split('; ');
        cookies = {};

        for(var i=c.length-1; i>=0; i--){
           var C = c[i].split('=');
           cookies[C[0]] = C[1];
        }

        return cookies[name];
    }

    return {
        read: readCookies
    };

});