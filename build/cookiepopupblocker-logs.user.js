// ==UserScript==
// @name           CookiePopupBlocker
// @version        1.1
// @description    Blokuje banery z informacją o używaniu przez witrynę cookies
// @run-at         document-start
// @namespace      https://github.com/piotrex
// @include        http://*.pl*
// @include        https://*.pl*
// @grant          GM_listValues
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_registerMenuCommand
// @updateURL      http://userscripts.org/scripts/source/163699.meta.js
// @downloadURL    https://raw.github.com/piotrex/CookiePopupBlocker/master/build/cookiepopupblocker-logs.user.js
// @license        GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @icon           data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QQCEBoMmEDemgAABTdJREFUWMO1V1tIVFsY/tbeM2NutWkmy1sS9eCEBjE0hHhEQWdyGpTpDEl0IbpRIAjRa1DUez70VkRZIAhSPfQiHt/q2IPQRUowAiOizkvHmsga3Xt95+GfcWbUTE+6YLFYa2at7/tva31bYenmAeANh8Ov62pqTKUUTNM0AUApZQCAMgxDpecq3UDi79HRb1+TyfJnz5/bAGZ+BqCWAjcNo+jPROLfgYEBh319BtxuUGtAa4BUlBFwHBAAbFvGb9/gPnfOaW1pMU3TtP4aHnaWIrEouGVZ3kQiQZIO9+whBWp53eUiq6pI0g63tjK0e7eV9ubywP1+vzcejwt4fb0cuBICAOnxkBUVJGm37d3LQE1N8XJIeKq3bClpb28nSZsNDf8PPJdEeTlJ2rFolFWVlSVLkfAEamqK98ViAt7Y+HvguSQ2byZJuz0Wo9/n8y5GwhMKhay2aFTAm5tJ0/x98FwSpaUkacc7OmgVFm7IJeGJhMOF4UhEwFtaVhc8l8TGjSTpJPbvp2kYPgAeBINBq6W1VcDD4bUBzyXh95OkcyCRIIBNaGpqSpK0GY2ShrFwk1LSV5OEz5cp0Smjob6+yH7zxsTgoFwwAOByZbNj3TrZKtffz+vHMH5d4C4XMDMDTE2BQ0NG3Y4dpqEAhYKC/IO2bwfGxgR4elrGz59lLC5eaNeXL8CFC7K/oADo6Vn4n9evgdpaQG5yQCkYSimDgDNnmcsFNDQAExNAICBrY2PA27eA1yvzjDcA4NYt4NEjYP164MoVoLtbAJJJ4McP4N07oL9f5lu3Ai9eAI4jx8g7ogySWVa2LQc6DjA0JC7ftQvYtm1x9586BTQ1Ab29AnjwoHgMkDNGRoBDh4CyMsAzr/QdR2UCp+cOj8dlNE2go2Pes6UWJ6GUWEgCs7P56z4fEAwCN27IWm9v9ncShmHApbWmyiTQzp1iycTEQiByYaKdPy+hOnNG5j09QFFRNpxtbdJTKWB8HLh8WYiRoNZQgOHKy+6ZGQEpK/t1RmsNXL2anZ88CTx8KK5OP9EYGQGuXZPku3gRmJyUBJ+clP1KwSCpVYbA48dyQHk5UFcHuN1iSSZ+uR4wDCHudst4925+qLQG3r8H7t8HLl0Cnj0Dvn8Hjh4FlAIlBMqltc4m4ZMnwKdPUmovX4qFT58CFRWScLW1yCvZTLLljhljlJLKqauTHgzK+qtXWQ8BhgtKaShFAAqGAVRWAh8+CFBXl1ivtVi6WMsty0xolJJ9mRzItMFB8Uh6n1IKLmpNlfGA1lKKpaVAfT3Q2AhYltTzgwfi9lQKOHEi67X5zbaBgQFJOsPIVsfICPDxYx5xBZgurTXzrCPFgtFRcX9mzXGEoNZAX9/SyTk+LpWktYQhmcxe85nmdoMAEQ6Hp0javH597V7B+b27myTtpubmJABsOtDZKfrv5s21B+/qIkm7pbWVwWDQEvltmr45BXz79tqBnz0rz3AkwkgkUpiniizL2pBWwjbv3Fl98NOnRSFHowyFQovKdI/f7/fOKeK+vtUDP36cJO19sRgDgcCS8txTVVVVEsso4/7+3wc/dkwUcUcHq6urS5b1bRAIBIrnFPLAwP8HP3KEJJ14PE6/3+9d0ddRKBSy5pTyvXsrBz98WBRwIkHLslYEnpXrkUhhRjHPpFKc+fqVs9PTnJ2epp1KSXccOo5Dh9QOqXW6k7QPdHbSNE3fUuDqVySCwaCrpKTknz8aGooAgFqLhQICkjq9rqEUHMdxSOLV+LgzPDxcA+DLUl/G/wHD+CdOEzPO7QAAAABJRU5ErkJggg==
// ==/UserScript==
window.CPB_blocked_ed5gdg7f = null;
if(window.self === window.top)
{
 function getLogsArray()
 {
  var values_names = GM_listValues();
  var log_name;
  var log_array = [];
  var log_record;
  for(var i = 0 ; i < values_names.length ; i++)
  {
   if( ! /^CPB_/.test(values_names[i]) )
   {
    log_name = values_names[i];
    log_record = JSON.parse(GM_getValue(values_names[i]));
    log_record['site']=log_name;
    log_array.push(log_record);
   }
  }
  return log_array;
 }
 // http://stackoverflow.com/a/6169703/1794387
 function XDomainOneWayPOST(_url,/*Array of Objects*/ _data)
 {
  // Add the iframe with a unique name
  var iframe = document.createElement("iframe");
  var uniqueString = "CPB_hgfghf654";
  document.body.appendChild(iframe);
  iframe.style.display = "none";
  iframe.contentWindow.name = uniqueString;
  // construct a form with hidden inputs, targeting the iframe
  var form = document.createElement("form");
  form.target = uniqueString;
  form.action = _url;
  form.method = "POST";
  // repeat for each parameter
  var input;
  for(var i = 0 ; i < _data.length ; i++)
  {
   input = document.createElement("input");
   input.type = "hidden";
   input.name = _data[i].name;
   input.value = _data[i].value;
   form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
 }
 function cmd_showLogs()
 {
  document.body.innerHTML=("<code>"+JSON.stringify(getLogsArray())+"</code>");
 }
 function cmd_sendLogs()
 {
  XDomainOneWayPOST("https://script.google.com/macros/s/AKfycbyfPf_UT7Dndf7Z_FPvUIC-eIwhS8jijQDuugp2bk3gmhSS8Zbu/exec",[{name:"records",value:JSON.stringify(getLogsArray())}]);
 }
 function cmd_clearLogs()
 {
  var keys = GM_listValues();
  for (var k=0; k < keys.length ; k++)
  {
   if(! /^CBP_/.test(GM_getValue(keys[k])))
    GM_deleteValue(keys[k]);
  }
 }
 // http://stackoverflow.com/a/4588211/1794387
 function getCssSelector(el)
 {
  var names = [];
  while (el.parentNode)
  {
   if (el.id)
   {
    names.unshift('#' + el.id);
    break;
   }
   else if(el.className)
   {
    classes = el.className.split(' ');
    names.unshift('.'+classes[0]);
    break;
   }
   else
   {
    if (el == el.ownerDocument.documentElement)
     names.unshift(el.tagName);
    else
    {
     for (var c = 1, e = el; e.previousElementSibling; e = e.previousElementSibling, c++);
     names.unshift(el.tagName + ":nth-child(" + c + ")");
    }
    el = el.parentNode;
   }
  }
  return names.join(">");
 }
 var cookie_ids = [/cook/i];
 function isCookieLabeled(node)
 {
  if( cookie_ids[0].test(node.id) ||
   cookie_ids[0].test(node.className) )
   return true;
  else
   return false;
 }
 function isCookieLabeled_weaker(node)
 {
  if( /cookie/i.test(node.id) ||
   /cookie/i.test(node.className) )
   return true;
  else
   return false;
 }
 var cookie_words = [/cookie|ciastecz/i, /u(ż|z)ywa|korzyst|stosuje|pos(ł|l)ugu/i, /wiedzie|wi(ę|e)cej|informacj|szczeg|polity|akcept|zgod|czym s(ą|a)/i];
 function hasCookiesContent(node)
 {
  var node_text;
  if(typeof node.tagName !== 'undefined' && node.tagName.toUpperCase() === 'IFRAME')
  {
   try {
    node_text = node.contentDocument.body.textContent;
   }
   catch(e) {
    node_text = '';
   }
  }
  else
   node_text = node.textContent;
  if( node_text.length > 100 &&
   node_text.length < 1000 &&
   cookie_words[0].test(node_text) &&
   cookie_words[1].test(node_text) &&
   cookie_words[2].test(node_text) )
  {
   return true;
  }
  else
   return false;
 }
 function popupBlock(root_node/*, call_when_not_removed*/)
 {
  var node_curr;
  var cookie_labeled_weaker;
  var divs_iframes = (root_node.getElementsByTagName)?(Array.prototype.slice.call(root_node.getElementsByTagName('div'))).concat(Array.prototype.slice.call(root_node.getElementsByTagName('iframe'))) : [];
  var nodes = (root_node === document)? divs_iframes : [root_node].concat(divs_iframes);
  for (var node_i = 0 ; node_i < nodes.length && window.CPB_blocked_ed5gdg7f !== true ; node_i++)
  {
   node_curr = nodes[node_i];
   cookie_labeled_weaker = isCookieLabeled_weaker(node_curr);
   if( root_node !== document ||
    node_i < 5 ||
    nodes.length-1 - node_i < 10 ||
    cookie_labeled_weaker )
   {
    if ( cookie_labeled_weaker || hasCookiesContent(node_curr) )
    {
     if( !cookie_labeled_weaker )
     {
      var node_childs = ((typeof (node_curr.getElementsByTagName('div'))!=='undefined')?node_curr.getElementsByTagName('div'):[]);
      for( var i = 0 ; i < node_childs.length ; i++)
       if(isCookieLabeled(node_childs[i]))
       {
        if(hasCookiesContent(node_childs[i]))
         node_curr = node_childs[i];
        break;
       }
     }
     GM_setValue(window.location.hostname, JSON.stringify({css:getCssSelector(node_curr), text:((typeof (node_curr.textContent)!=='undefined')?node_curr.textContent:''), blocked:true, tag_name: node_curr.tagName}));
     cmd_sendLogs();
     cmd_clearLogs();
     node_curr.parentNode.removeChild(node_curr);
     /*call_when_not_removed();*/
     window.CPB_blocked_ed5gdg7f = true;
     return;
    }
   }
  }
 }
 function dom_listener(mutations, observer)
 {// DEBUGGER
  for (var i = 0 ; i < mutations.length ; i++)
  {
   var added_nodes = mutations[i].addedNodes;
   if(added_nodes)
    for(var j = 0 ; j < added_nodes.length ; j++)
    {
     if(window.CPB_blocked_ed5gdg7f)
     {
      observer.disconnect();
      return;
     }
     popupBlock( added_nodes[j]/*,null*/ );
    }
  }
 }
  GM_setValue(window.location.hostname, JSON.stringify({'css':'', 'text':'', 'blocked':false, 'tag_name':null}));
 // var interval = 500;
 // var repeating_time = 10000;
 // var next_time = 0;
 // function trigger() 
 // {
  // next_time += interval;
  // if (BLOCKED!==true && next_time < repeating_time && document.readyState !== 'complete')
   // setTimeout(trigger, interval);
 // }	
 //setTimeout(trigger,	interval);
 document.onreadystatechange = function()
 {
  if(document.readyState === 'interactive')
  {
   var observer = new MutationObserver(dom_listener);
   observer.observe(document, {childList : true, subtree: true});
   if( ! window.CPB_blocked_ed5gdg7f )
    popupBlock(
     document/*,

					null*/
    );
  }
  else if(document.readyState === 'complete')
  {
   var storage_log = JSON.parse(GM_getValue(window.location.hostname, {}));
   storage_log['cookie_found'] = /cookie/i.test(document.body.textContent);
   GM_setValue(window.location.hostname, JSON.stringify(storage_log));
  }
 };
 GM_registerMenuCommand("Show logs", cmd_showLogs);
 GM_registerMenuCommand("Send and clear logs", function(){cmd_sendLogs();cmd_clearLogs();});
}