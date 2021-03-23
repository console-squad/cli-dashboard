{{ config(
    materialized = 'table',
    dist = 'country_k',
    sort = 'province_k'
) }}

WITH unpivoted AS (
    {{ dbt_utils.unpivot(
        relation = ref('time_series_covid19_recovered_global'),
        cast_to = 'INT',
        exclude = ['province','country'],
        remove = ['lat','lon'],
        field_name = 'ymd',
        value_name = 'recovered'
    ) }}
),
keyed AS (
    SELECT
        co.country_k,
        p.province_k,
        TO_DATE(
            SUBSTRING(
                up.ymd
                FROM
                    5
            ),
            'YYYYMMDD'
        ) AS dt,
        recovered
    FROM
        unpivoted AS up
        INNER JOIN {{ ref('stg_csse_country') }} AS co
        ON co."name" = up.country
        LEFT JOIN {{ ref('stg_csse_province') }} AS p
        ON p.province = up.province
)
SELECT
    country_k,
    NVL(
        province_k,
        '0'
    ) AS province_k,
    dt,
    SUM(recovered) AS cume_recoveries,
    cume_recoveries - LAG(cume_recoveries) over (
        PARTITION BY country_k,
        province_k
        ORDER BY
            dt
    ) AS new_recoveries
FROM
    keyed
GROUP BY
    country_k,
    province_k,
    dt
