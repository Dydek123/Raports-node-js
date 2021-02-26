var zip = new JSZip('public/uploads/Documents/Dok1.docx');
var doc=new Docxtemplater().loadZip(zip)
var text= doc.getFullText();
console.log(text);