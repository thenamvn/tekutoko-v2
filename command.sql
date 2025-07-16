select * from banned_users;
select * from users;
SHOW EVENTS;
DROP EVENT IF EXISTS delete_expired_vouchers;
select * from vouchers;

``` event tự động xoá vouchers trên mysql
CREATE EVENT IF NOT EXISTS delete_expired_vouchers
ON SCHEDULE EVERY 1 DAY
DO
    -- Xoá các liên kết trong user_vouchers trước khi xoá voucher
    DELETE FROM user_vouchers
    WHERE voucher_id IN (
        SELECT id FROM vouchers WHERE expiration_date < CURDATE()
    );

    -- Xoá các voucher hết hạn
    DELETE FROM vouchers
    WHERE expiration_date < CURDATE();
```