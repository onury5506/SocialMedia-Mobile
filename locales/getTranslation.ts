import { TranslateResultDto } from "@/api/models/translate-result-dto";
import { getLocales } from "expo-localization";

export function getTranslation(translateResultDto: TranslateResultDto): string {
    let {languageCode, languageTag} = getLocales()[0]

    let languageTagParts = languageTag.split('-')
    if (languageTagParts.length > 2) {
        languageTag = languageTagParts[0] + '-' + languageTagParts[2]
    }

    return translateResultDto.translations[languageCode as keyof typeof translateResultDto.translations] ||
        translateResultDto.translations[languageTag as keyof typeof translateResultDto.translations] ||
        translateResultDto.translations.en
}