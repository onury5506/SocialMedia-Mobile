/* tslint:disable */
/* eslint-disable */
/**
 * Social Media API
 * The Social Media API description
 *
 * OpenAPI spec version: 1.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

 /**
 * 
 *
 * @export
 * @interface RegisterUserDTO
 */
export interface RegisterUserDTO {

    /**
     * Username of the user
     *
     * @type {string}
     * @memberof RegisterUserDTO
     * @example onury5506
     */
    username: string;

    /**
     * Name of the user
     *
     * @type {string}
     * @memberof RegisterUserDTO
     * @example Onur Yıldız
     */
    name: string;

    /**
     * Email of the user
     *
     * @type {string}
     * @memberof RegisterUserDTO
     * @example example@example.com
     */
    email: string;

    /**
     * Password of the user
     *
     * @type {string}
     * @memberof RegisterUserDTO
     * @example password123
     */
    password: string;

    /**
     * Language of the user
     *
     * @type {string}
     * @memberof RegisterUserDTO
     * @example en
     */
    language: RegisterUserDTOLanguageEnum;
}

/**
 * @export
 * @enum {string}
 */
export enum RegisterUserDTOLanguageEnum {
    En = 'en',
    Es = 'es',
    Fr = 'fr',
    De = 'de',
    It = 'it',
    PtPT = 'pt-PT',
    PtBR = 'pt-BR',
    Ru = 'ru',
    Ja = 'ja',
    ZhCN = 'zh-CN',
    ZhTW = 'zh-TW',
    Ko = 'ko',
    Ar = 'ar',
    Hi = 'hi',
    Tr = 'tr',
    Nl = 'nl',
    Pl = 'pl',
    Uk = 'uk',
    El = 'el',
    Id = 'id',
    Sv = 'sv',
    Cs = 'cs',
    Fi = 'fi',
    Ro = 'ro',
    No = 'no',
    Bg = 'bg',
    Sr = 'sr',
    Hr = 'hr',
    Bs = 'bs',
    Sl = 'sl'
}

