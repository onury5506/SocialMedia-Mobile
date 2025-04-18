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

import { CommentDataWithLikedDto } from './comment-data-with-liked-dto';
import { PaginatedDto } from './paginated-dto';
 /**
 * 
 *
 * @export
 * @interface InlineResponse2002
 */
export interface InlineResponse2002 extends PaginatedDto {

    /**
     * @type {Array<CommentDataWithLikedDto>}
     * @memberof InlineResponse2002
     */
    data?: Array<CommentDataWithLikedDto>;

    /**
     * @type {number}
     * @memberof InlineResponse2002
     */
    page?: number;

    /**
     * @type {number}
     * @memberof InlineResponse2002
     */
    nextPage?: number;

    /**
     * @type {boolean}
     * @memberof InlineResponse2002
     */
    hasNextPage?: boolean;
}
