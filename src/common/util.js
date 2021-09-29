export default function getLocale() {
  const ptLang = ['pt-BR', 'pt-br'];
  const lang = navigator.language;
  if (ptLang.includes(lang)) {
    return 'pt-BR';
  }
  if (lang === 'id' || lang === 'es') {
    return lang;
  }
  return 'en-US';
}
