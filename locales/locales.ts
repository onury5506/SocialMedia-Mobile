import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import english from './files/en.json';
import turkish from './files/tr.json';

export const i18n = new I18n({
    en: english,
    tr: turkish,
});

export let {languageCode, languageTag} = getLocales()[0]

const languageTagSplit = languageTag.split('-')

if(languageTagSplit.length > 2){
    languageTag = languageTagSplit[0]+'-'+languageTagSplit[2].toUpperCase()
}else if(languageTagSplit.length == 2){
    languageTag = languageTagSplit[0]+'-'+languageTagSplit[1].toUpperCase()
}else{
    languageTag = languageTagSplit[0]
}

const deviceLanguage = getLocales()?.[0]?.languageCode ?? 'en';

if (!i18n.translations[deviceLanguage]) {
    i18n.locale = 'en';
}else{
    i18n.locale = deviceLanguage;
}