/**
 * 和业务相关的一些常量
 */

/**
 * 用户账号状态
 */
export const USER_STATUS_REVIEWING = 0 // 审核中
export const USER_STATUS_APPROVED = 1 // 审核通过
export const USER_STATUS_REJECTED = 2 // 审核未通过

/**
 * 用户与书单关系
 */
export const BL_NO_RELATION = 0 // 没有任何关系
export const BL_IS_CREATOR = 1 // 创建者
export const BL_IS_FAVORITE = 2 // 收藏者

/**
 * 订单状态
 */

/* —————————— 1001 - 1010: order is in process 订单进行中 —————————— */

/**
 * 1001: User is waiting for others to return the book and the
 * user will get a notification when someone returns the book.
 * 预约中: 图书无库存，用户预约此图书，正在等待其他用户归还.
 */
export const ORDER_STATUS_WAITING_FOR_OTHERS_TO_RETURN = 1001

/**
 * 1002: others have returned. Wait for user to take the book.
 * 其他用户已经归还图书，正在等待用户取书.
 */
export const ORDER_STATUS_WAITING_TO_TAKE_RETURNED_BOOK = 1002

/**
 * 1003: Wait for user to take the book at the planed time.
 * 预订中: 图书充足，用户预订此图书，将在约定的时间前往图书馆取书.
 */
export const ORDER_STATUS_WAITING_TO_TAKE_AT_PLANED_TIME = 1003

/**
 * 1004: User have taken the book, not returned yet.
 * 借书借阅中.
 */
export const ORDER_STATUS_BORROWING = 1004

/* —————————— 1011-1020: order has been closed 订单结束 —————————— */

/**
 * 1011: Return book and close order normally.
 * 正常关闭.
 */
export const ORDER_STATUS_NORMAL_CLOSE = 1011

/**
 * 1012: Return book and close order abnormally.
 * 非正常关闭, 需要支付罚金. 如图书损坏.
 */
export const ORDER_STATUS_ABNORMAL_CLOSE = 1012

/* —————————— 1021-1030: order has been canceled 订单取消 —————————— */

/**
 * 1021: User cancel the order. Or. Not take book at the point time.
 * 用户自己取消预约/预订订单. 或, 未在规定时间取书，系统自动取消订单.
 */
export const ORDER_STATUS_CANCELED_BY_USER = 1021
