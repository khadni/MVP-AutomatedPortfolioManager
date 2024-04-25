// todo

- CryptoCompare API response example:

        {
        "Response": "Success",
        "Message": "",
        "HasWarning": false,
        "Type": 100,
        "RateLimit": {},
        "Data": {
            "id": 1182,
            "time": 1713916800,
            "symbol": "BTC",
            "partner_symbol": "BTC",
            "concentrationVar": {
            "category": "on_chain",
            "sentiment": "neutral",
            "value": -0.0000047566653137203935,
            "score": 0.49881083367156986,
            "score_threshold_bearish": 0.25,
            "score_threshold_bullish": 0.75
            },
            "largetxsVar": {
            "category": "on_chain",
            "sentiment": "bearish",
            "value": -0.054070912777176156,
            "score": 0,
            "score_threshold_bearish": 0.25,
            "score_threshold_bullish": 0.75
            },
            "addressesNetGrowth": {
            "category": "on_chain",
            "sentiment": "bearish",
            "value": 0.00169761172981097,
            "score": 0.20119524115661555,
            "score_threshold_bearish": 0.25,
            "score_threshold_bullish": 0.75
            },
            "inOutVar": {
            "category": "on_chain",
            "sentiment": "neutral",
            "value": 0.0027408966436150805,
            "score": 0.5204856791278225,
            "score_threshold_bearish": 0.25,
            "score_threshold_bullish": 0.75
            }
        }
        }

- GVZ index explanation: https://www.forex.com/ie/news-and-analysis/gvz-index/
