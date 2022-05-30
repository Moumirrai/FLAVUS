let title = 'apocalypse - cigarettes after sex (slowed)';
//create regex expression that splits string on all characters in split array
//var words = title.split(/[ .:;?!~,`"&|()<>{}\[\]\r\n/\\]+/); // note ' and - are kept
const regex = new RegExp(/[ -/<>(){}\[\].,\\*-+=%'´§_:?!°"#&@|˛`˙˝¨¸~•]+/);

//split string on regex expression, and remove empty strings
let words = title.split(regex).filter(Boolean);

console.log(words);
