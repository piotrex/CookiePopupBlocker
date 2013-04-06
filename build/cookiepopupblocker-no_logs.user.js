// ==UserScript==
// @name           CookiePopupBlocker
// @version        1.1.1
// @description    Blokuje banery z informacją o używaniu przez witrynę cookies
// @run-at         document-start
// @namespace      https://github.com/piotrex
// @include        http://*.pl*
// @include        https://*.pl*
// @grant          none
// @downloadURL    https://raw.github.com/piotrex/CookiePopupBlocker/master/build/cookiepopupblocker-no_logs.user.js
// @updateURL      https://raw.github.com/piotrex/CookiePopupBlocker/master/build/cookiepopupblocker-no_logs.user.js
// @license        GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @icon           https://raw.github.com/piotrex/CookiePopupBlocker/master/icon/32x32.png
// ==/UserScript==
window.CPB_blocked_ed5gdg7f = null;
if(window.self === window.top)
{
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
 var cookie_words = [/cookie|ciastecz/i, /u(ż|z)ywa|korzyst|stosuje|pos(ł|l)ugu/i, /wiedzie|wi(ę|e)cej|informacj|szczeg|polity|akcept|zgod|czym s(ą|a)|przegl(a|ą)dark/i];
 var footer_words = [/©|copyright/i];
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
   if (footer_words[0].test(node_text)) // if (node is footer)
    return false;
   else
    return true;
  }
  else
   return false;
 }
 // runed at document.body has been loaded (root_node=document.body) or it is inserted node to doc after doc loaded
 function popupBlock(root_node/*, call_when_not_removed*/)
 {
  var node_curr;
  var cookie_labeled_weaker;
  var cookie_labeled_stronger;
  var divs_iframes = (root_node.getElementsByTagName)?(Array.prototype.slice.call(root_node.getElementsByTagName('div'))).concat(Array.prototype.slice.call(root_node.getElementsByTagName('iframe'))) : [];
  var nodes = (root_node === document)? divs_iframes : [root_node].concat(divs_iframes);
  for (var node_i = 0 ; node_i < nodes.length && window.CPB_blocked_ed5gdg7f !== true ; node_i++)
  {
   node_curr = nodes[node_i];
   cookie_labeled_weaker = isCookieLabeled_weaker(node_curr);
   cookie_labeled_stronger = isCookieLabeled(node_curr);
   if( root_node !== document || // initial filter
    node_i < 5 ||
    nodes.length-1 - node_i < 10 ||
    cookie_labeled_weaker )
   {
    if ( cookie_labeled_stronger || hasCookiesContent(node_curr) ) // if ( this node is really cookie popup )
    {
     // prevent interpret and block parent of cookie node
     if( !cookie_labeled_stronger )
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
     node_curr.parentNode.removeChild(node_curr);
     /*call_when_not_removed();*/
     window.CPB_blocked_ed5gdg7f = true;
     return;
    }
   }
  }
 }
 function dom_listener(mutations, observer)
 {
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
 document.addEventListener(
  'readystatechange',
  function()
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
  },
  /*useCapture = */ true
 );
}
