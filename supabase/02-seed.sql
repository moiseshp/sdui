-- =============================================================================
-- BDUI Demo · 02 · Seed (views + bottom bar initiatives)
-- -----------------------------------------------------------------------------
-- GENERATED FILE. Do not edit by hand.
-- Source:      contract/fixtures/ (variants.json, variant-*.json, initiatives.json)
-- Regenerate:  npm run db:seed
--
-- Where:  Supabase → SQL Editor → New query → paste everything → Run.
-- Order:  after 01-schema.sql.
-- Idempotent: updates existing rows. Only touches demo_users to move people
-- off views that no longer exist. Never changes whether an initiative is on.
-- =============================================================================

-- 1. Views
insert into public.variants (id, name, description, screen)
values
  (
    'guest',
    'Default (no logeado)',
    'Lo que ve quien entra sin sesión: banner, combos, lo más top, promos de la semana y oferta.',
    $json${
  "schemaVersion": "1.2.0",
  "screenId": "kfc_home",
  "layout": "default",
  "theme": "default",
  "header": {
    "id": "guest_header",
    "type": "header_default",
    "version": 1,
    "props": {
      "position": "sticky",
      "variant": "default"
    }
  },
  "sections": [
    {
      "id": "guest_hero",
      "type": "hero_banner",
      "version": 1,
      "props": {
        "items": [
          {
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/banners/mobile/dipeo.webp",
            "alt": "Mega Dipeo - Combo desde S/24.90"
          },
          {
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/banners/MOBILE_CYB_20260420.png",
            "alt": "Big Box - La caja que lo tiene todo"
          },
          {
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/banners/BANNER_LDHW_2_MOBILE.jpg",
            "alt": "Nuevos Krushers - Refréscate"
          }
        ],
        "viewportMode": "full",
        "autoplay": true,
        "autoplayInterval": 5000,
        "showDots": true
      }
    },
    {
      "id": "guest_most_chosen",
      "type": "featured_products",
      "version": 1,
      "props": {
        "title": "Los combos más elegidos 🔥",
        "layout": "carousel",
        "items": [
          {
            "id": "prod_001",
            "name": "Mega Familiar 15 Piezas",
            "description": "15 piezas de pollo + 3 papas grandes + ensalada + 1.5L bebida",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/mega-promo-8-piezas-202602160411187422.jpg",
            "price": "S/ 89.90",
            "originalPrice": "S/ 109.90",
            "badge": "-30%"
          },
          {
            "id": "prod_002",
            "name": "Big Box Original",
            "description": "2 piezas de pollo + papas + ensalada + bebida + postre",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/mega-promo-10-piezas-202602160411385589.jpg",
            "price": "S/ 24.90",
            "originalPrice": "S/ 27.90",
            "badge": "-15%"
          },
          {
            "id": "prod_003",
            "name": "Chicken Strips x6",
            "description": "6 strips crocantes + salsa BBQ o ranch",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/mega-promo-10-piezas-202602160411385589.jpg",
            "price": "S/ 29.90",
            "originalPrice": "S/ 37.90",
            "badge": "-20%"
          },
          {
            "id": "prod_004",
            "name": "Dúo Twister XL con papas",
            "description": "2 Twister XL + 2 papas medianas",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/duo-twister-xl-con-papas-202602160411547690.jpg",
            "price": "S/ 32.90",
            "originalPrice": "S/ 38.90",
            "badge": "-15%"
          }
        ]
      }
    },
    {
      "id": "guest_top",
      "type": "featured_products",
      "version": 1,
      "props": {
        "title": "Lo más top del momento 🍟",
        "layout": "carousel",
        "items": [
          {
            "id": "prod_101",
            "name": "Para Compartir",
            "description": "8 piezas de pollo + 2 papas familiares + 1.5L bebida",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/sections/para_compartir_delivery.jpg",
            "price": "S/ 64.90",
            "badge": "#1"
          },
          {
            "id": "prod_102",
            "name": "Para 2",
            "description": "4 piezas de pollo + 2 papas + 2 bebidas",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/sections/para_2_delivery.jpg",
            "price": "S/ 39.90",
            "badge": "#2"
          },
          {
            "id": "prod_103",
            "name": "Para ti",
            "description": "2 piezas de pollo + papas + bebida",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/sections/para_ti_delivery.jpg",
            "price": "S/ 18.90",
            "badge": "#3"
          },
          {
            "id": "prod_104",
            "name": "Twister XL",
            "description": "Twister XL + papas + bebida",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/sections/twister_delivery.jpg",
            "price": "S/ 21.90",
            "badge": "#4"
          }
        ]
      }
    },
    {
      "id": "guest_weekly_promos",
      "type": "featured_products",
      "version": 1,
      "props": {
        "title": "Las promociones de la semana 📅",
        "layout": "carousel",
        "items": [
          {
            "id": "promo_mon",
            "name": "Lunes: Twister XL 2x1",
            "description": "Todo el día, en delivery y en tienda",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/sections/twister_delivery.jpg",
            "price": "S/ 21.90",
            "badge": "LUN"
          },
          {
            "id": "promo_tue",
            "name": "Martes de Chicken Strips",
            "description": "12 strips al precio de 8",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/mega-promo-10-piezas-202602160411385589.jpg",
            "price": "S/ 29.90",
            "badge": "MAR"
          },
          {
            "id": "promo_wed",
            "name": "Miércoles Para 2",
            "description": "Postre gratis para los dos",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/sections/para_2_delivery.jpg",
            "price": "S/ 39.90",
            "badge": "MIÉ"
          },
          {
            "id": "promo_thu",
            "name": "Jueves de Mega",
            "description": "Mega 8 Piezas con papas familiares",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/mega-promo-8-piezas-202602160411187422.jpg",
            "price": "S/ 59.90",
            "badge": "JUE"
          },
          {
            "id": "promo_wkd",
            "name": "Finde para compartir",
            "description": "Bebida 1.5L gratis con cualquier combo para compartir",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/sections/para_compartir_delivery.jpg",
            "price": "S/ 64.90",
            "badge": "VIE-DOM"
          }
        ]
      }
    },
    {
      "id": "guest_offer",
      "type": "promo_banner",
      "version": 1,
      "props": {
        "title": "Oferta de la semana",
        "description": "Big Box Original a S/ 21.90. Crea tu cuenta y desbloquea ofertas Solo por hoy.",
        "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/mega-promo-10-piezas-202602160411385589.jpg",
        "badge": "OFERTA",
        "actions": {
          "onPress": [
            {
              "type": "NAVIGATE",
              "payload": {
                "url": "/ingresar"
              }
            }
          ]
        }
      }
    }
  ],
  "meta": {
    "title": "KFC Perú - Inicio",
    "description": "Vista Default: usuario sin sesión. El backend la entrega a cualquiera que no se haya registrado."
  }
}$json$::jsonb
  ),
  (
    'logged',
    'Logeado',
    'Vista inicial al registrarse: saludo, anuncio exclusivo, elegidos para ti, favoritos y Solo por hoy.',
    $json${
  "schemaVersion": "1.2.0",
  "screenId": "kfc_home",
  "layout": "default",
  "theme": "default",
  "header": {
    "id": "logged_header",
    "type": "header_greeting",
    "version": 1,
    "props": {
      "title": "¡Hola, {{firstName}}!",
      "subtitle": "¿Qué se te antoja hoy?",
      "position": "sticky",
      "variant": "default"
    }
  },
  "sections": [
    {
      "id": "logged_announcement",
      "type": "announcement_bar",
      "version": 1,
      "props": {
        "message": "🔓 Solo con tu cuenta: delivery gratis en pedidos desde S/ 39.90 hasta el domingo",
        "variant": "dark",
        "isDismissible": true
      }
    },
    {
      "id": "logged_picked_for_you",
      "type": "featured_products",
      "version": 1,
      "props": {
        "title": "Elegidos para ti ⭐",
        "layout": "carousel",
        "items": [
          {
            "id": "prod_002",
            "name": "Big Box Original",
            "description": "Porque siempre vuelves a tu Big Box",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/mega-promo-10-piezas-202602160411385589.jpg",
            "price": "S/ 24.90",
            "originalPrice": "S/ 27.90",
            "badge": "-15%"
          },
          {
            "id": "prod_004",
            "name": "Dúo Twister XL con papas",
            "description": "Ideal para tus almuerzos de semana",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/duo-twister-xl-con-papas-202602160411547690.jpg",
            "price": "S/ 32.90",
            "originalPrice": "S/ 38.90",
            "badge": "-15%"
          },
          {
            "id": "prod_001",
            "name": "Mega Familiar 15 Piezas",
            "description": "Para tus viernes en familia",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/mega-promo-8-piezas-202602160411187422.jpg",
            "price": "S/ 89.90",
            "originalPrice": "S/ 109.90",
            "badge": "-30%"
          }
        ]
      }
    },
    {
      "id": "logged_favorites",
      "type": "featured_products",
      "version": 1,
      "props": {
        "title": "Tu lista de favoritos ❤️",
        "layout": "grid",
        "items": [
          {
            "id": "fav_001",
            "name": "Para ti",
            "description": "2 piezas de pollo + papas + bebida",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/sections/para_ti_delivery.jpg",
            "price": "S/ 18.90"
          },
          {
            "id": "fav_002",
            "name": "Twister XL",
            "description": "Twister XL + papas + bebida",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/sections/twister_delivery.jpg",
            "price": "S/ 21.90"
          }
        ]
      }
    },
    {
      "id": "logged_today",
      "type": "promo_banner",
      "version": 1,
      "props": {
        "title": "Solo por hoy",
        "description": "Mega 8 Piezas a S/ 59.90. Válido hasta las 11:59 pm.",
        "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/mega-promo-8-piezas-202602160411187422.jpg",
        "badge": "SOLO HOY"
      }
    }
  ],
  "meta": {
    "title": "KFC Perú - Inicio",
    "description": "Vista Logeado."
  }
}$json$::jsonb
  ),
  (
    'loyalty',
    'Loyalty',
    'Misma home del logeado con la marca en negro y el estado de puntos del Club.',
    $json${
  "schemaVersion": "1.2.0",
  "screenId": "kfc_home",
  "layout": "default",
  "theme": "loyalty",
  "header": {
    "id": "loyalty_header",
    "type": "header_greeting",
    "version": 1,
    "props": {
      "title": "¡Hola, {{firstName}}!",
      "subtitle": "Miembro Club KFC Gold ★",
      "position": "sticky",
      "variant": "default"
    }
  },
  "sections": [
    {
      "id": "loyalty_announcement",
      "type": "announcement_bar",
      "version": 1,
      "props": {
        "message": "★ Club KFC: este fin de semana sumas puntos dobles en todos tus pedidos",
        "variant": "light",
        "isDismissible": true
      }
    },
    {
      "id": "loyalty_status",
      "type": "loyalty_card",
      "version": 1,
      "props": {
        "tierLabel": "Club Gold",
        "pointsLabel": "2,450 pts",
        "progress": 82,
        "progressLabel": "Te faltan 550 puntos para subir a Platinum."
      }
    },
    {
      "id": "loyalty_picked_for_you",
      "type": "featured_products",
      "version": 1,
      "props": {
        "title": "Elegidos para ti ⭐",
        "layout": "carousel",
        "items": [
          {
            "id": "prod_002",
            "name": "Big Box Original",
            "description": "Suma 50 puntos Club",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/mega-promo-10-piezas-202602160411385589.jpg",
            "price": "S/ 24.90",
            "originalPrice": "S/ 27.90",
            "badge": "-15%"
          },
          {
            "id": "prod_004",
            "name": "Dúo Twister XL con papas",
            "description": "Suma 65 puntos Club",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/duo-twister-xl-con-papas-202602160411547690.jpg",
            "price": "S/ 32.90",
            "originalPrice": "S/ 38.90",
            "badge": "-15%"
          },
          {
            "id": "prod_001",
            "name": "Mega Familiar 15 Piezas",
            "description": "Suma 180 puntos Club",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/mega-promo-8-piezas-202602160411187422.jpg",
            "price": "S/ 89.90",
            "originalPrice": "S/ 109.90",
            "badge": "-30%"
          }
        ]
      }
    },
    {
      "id": "loyalty_favorites",
      "type": "featured_products",
      "version": 1,
      "props": {
        "title": "Tu lista de favoritos ❤️",
        "layout": "grid",
        "items": [
          {
            "id": "fav_001",
            "name": "Para ti",
            "description": "2 piezas de pollo + papas + bebida",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/sections/para_ti_delivery.jpg",
            "price": "S/ 18.90"
          },
          {
            "id": "fav_002",
            "name": "Twister XL",
            "description": "Twister XL + papas + bebida",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/sections/twister_delivery.jpg",
            "price": "S/ 21.90"
          }
        ]
      }
    },
    {
      "id": "loyalty_today",
      "type": "promo_banner",
      "version": 1,
      "props": {
        "title": "Solo por hoy, exclusivo Club",
        "description": "Mega 8 Piezas a S/ 54.90 y sumas 180 puntos.",
        "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/mega-promo-8-piezas-202602160411187422.jpg",
        "badge": "CLUB GOLD"
      }
    }
  ],
  "meta": {
    "title": "KFC Perú - Inicio",
    "description": "Vista Loyalty: misma home del logeado con tema loyalty."
  }
}$json$::jsonb
  ),
  (
    'christmas',
    'Navidad',
    'Tema navideño: banquete, mesa navideña y pre-orden de Nochebuena.',
    $json${
  "schemaVersion": "1.2.0",
  "screenId": "kfc_home",
  "layout": "default",
  "theme": "christmas",
  "header": {
    "id": "christmas_header",
    "type": "header_greeting",
    "version": 1,
    "props": {
      "title": "¡Felices fiestas, {{firstName}}! 🎄",
      "subtitle": "Esta Navidad, la cena la ponemos nosotros",
      "position": "sticky",
      "variant": "default"
    }
  },
  "sections": [
    {
      "id": "christmas_announcement",
      "type": "announcement_bar",
      "version": 1,
      "props": {
        "message": "🎁 Reserva tu pedido de Nochebuena y recógelo el 24 sin filas",
        "variant": "dark",
        "isDismissible": false
      }
    },
    {
      "id": "christmas_feast",
      "type": "promo_banner",
      "version": 1,
      "props": {
        "title": "Banquete navideño",
        "description": "Mega Familiar 15 Piezas + 3 papas + ensalada + bebida 1.5L para toda la familia.",
        "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/sections/para_compartir_delivery.jpg",
        "badge": "NAVIDAD"
      }
    },
    {
      "id": "christmas_table",
      "type": "featured_products",
      "version": 1,
      "props": {
        "title": "Para la mesa navideña 🍗",
        "layout": "grid",
        "items": [
          {
            "id": "xmas_001",
            "name": "Mega Familiar 15 Piezas",
            "description": "Para 6 a 8 personas",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/mega-promo-8-piezas-202602160411187422.jpg",
            "price": "S/ 89.90"
          },
          {
            "id": "xmas_002",
            "name": "Para Compartir",
            "description": "Para 4 a 5 personas",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/sections/para_compartir_delivery.jpg",
            "price": "S/ 64.90"
          },
          {
            "id": "xmas_003",
            "name": "Mega 10 Piezas",
            "description": "Con papas familiares",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/mega-promo-10-piezas-202602160411385589.jpg",
            "price": "S/ 74.90"
          },
          {
            "id": "xmas_004",
            "name": "Para 2",
            "description": "Para la cena de a dos",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/sections/para_2_delivery.jpg",
            "price": "S/ 39.90"
          }
        ]
      }
    },
    {
      "id": "christmas_preorder",
      "type": "coupon_card",
      "version": 1,
      "props": {
        "title": "Pre-orden de Nochebuena",
        "description": "{{firstName}}, reserva antes del 20 de diciembre y llévate un postre gratis.",
        "code": "NAVIDAD26",
        "validUntilLabel": "Válido hasta el 20 de diciembre",
        "badge": "RESERVA"
      }
    }
  ],
  "meta": {
    "title": "KFC Perú - Navidad",
    "description": "Vista temática Navidad."
  }
}$json$::jsonb
  ),
  (
    'heavy',
    'Usuario heavy',
    'Beneficio por frecuencia, cupón Sólo para ti y sus pedidos de siempre.',
    $json${
  "schemaVersion": "1.2.0",
  "screenId": "kfc_home",
  "layout": "default",
  "theme": "default",
  "header": {
    "id": "heavy_header",
    "type": "header_greeting",
    "version": 1,
    "props": {
      "title": "¡Qué bueno verte, {{firstName}}!",
      "subtitle": "Eres de nuestros clientes más frecuentes",
      "position": "sticky",
      "variant": "default"
    }
  },
  "sections": [
    {
      "id": "heavy_benefit",
      "type": "announcement_bar",
      "version": 1,
      "props": {
        "message": "🏅 Por tus 14 pedidos de este mes, tus próximos 3 deliveries son gratis",
        "variant": "dark",
        "isDismissible": false
      }
    },
    {
      "id": "heavy_coupon",
      "type": "coupon_card",
      "version": 1,
      "props": {
        "title": "Sólo para ti",
        "description": "{{firstName}}, 25% de descuento en tu próximo Mega por ser cliente frecuente.",
        "code": "FIEL25",
        "validUntilLabel": "Válido hasta el domingo 11:59 pm",
        "badge": "CUPÓN"
      }
    },
    {
      "id": "heavy_usuals",
      "type": "featured_products",
      "version": 1,
      "props": {
        "title": "Tus de siempre 🔁",
        "layout": "carousel",
        "items": [
          {
            "id": "usual_001",
            "name": "Big Box Original",
            "description": "Lo pediste 9 veces",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/mega-promo-10-piezas-202602160411385589.jpg",
            "price": "S/ 24.90"
          },
          {
            "id": "usual_002",
            "name": "Twister XL",
            "description": "Lo pediste 7 veces",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/sections/twister_delivery.jpg",
            "price": "S/ 21.90"
          },
          {
            "id": "usual_003",
            "name": "Mega 8 Piezas",
            "description": "Lo pediste 4 veces",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/mega-promo-8-piezas-202602160411187422.jpg",
            "price": "S/ 69.90"
          },
          {
            "id": "usual_004",
            "name": "Para ti",
            "description": "Lo pediste 3 veces",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/sections/para_ti_delivery.jpg",
            "price": "S/ 18.90"
          }
        ]
      }
    },
    {
      "id": "heavy_reorder",
      "type": "promo_banner",
      "version": 1,
      "props": {
        "title": "Pide de nuevo",
        "description": "Tu último pedido: Big Box Original + Twister XL. Repítelo en un toque.",
        "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/duo-twister-xl-con-papas-202602160411547690.jpg",
        "badge": "1 TOQUE"
      }
    }
  ],
  "meta": {
    "title": "KFC Perú - Inicio",
    "description": "Vista Usuario heavy."
  }
}$json$::jsonb
  ),
  (
    'birthday',
    'Cumpleaños',
    'Saludo de cumpleaños, regalo del día y combos para celebrar.',
    $json${
  "schemaVersion": "1.2.0",
  "screenId": "kfc_home",
  "layout": "default",
  "theme": "default",
  "header": {
    "id": "birthday_header",
    "type": "header_greeting",
    "version": 1,
    "props": {
      "title": "¡Feliz cumpleaños, {{firstName}}! 🎂",
      "subtitle": "Hoy la celebración corre por nuestra cuenta",
      "position": "sticky",
      "variant": "default"
    }
  },
  "sections": [
    {
      "id": "birthday_announcement",
      "type": "announcement_bar",
      "version": 1,
      "props": {
        "message": "🎉 Tu regalo de cumpleaños está activo solo por hoy",
        "variant": "dark",
        "isDismissible": false
      }
    },
    {
      "id": "birthday_gift",
      "type": "coupon_card",
      "version": 1,
      "props": {
        "title": "Tu regalo de cumpleaños",
        "description": "{{firstName}}, llévate un postre y una bebida gratis con cualquier pedido de hoy.",
        "code": "FELIZCUMPLE",
        "validUntilLabel": "Válido solo hoy hasta las 11:59 pm",
        "badge": "REGALO"
      }
    },
    {
      "id": "birthday_party",
      "type": "featured_products",
      "version": 1,
      "props": {
        "title": "Arma tu celebración 🎉",
        "layout": "carousel",
        "items": [
          {
            "id": "party_001",
            "name": "Mega Familiar 15 Piezas",
            "description": "Para celebrar con todos",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/mega-promo-8-piezas-202602160411187422.jpg",
            "price": "S/ 89.90",
            "originalPrice": "S/ 109.90",
            "badge": "-30%"
          },
          {
            "id": "party_002",
            "name": "Para Compartir",
            "description": "8 piezas + 2 papas familiares + 1.5L bebida",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/sections/para_compartir_delivery.jpg",
            "price": "S/ 64.90"
          },
          {
            "id": "party_003",
            "name": "Chicken Strips x6",
            "description": "Para picar mientras llegan todos",
            "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/mega-promo-10-piezas-202602160411385589.jpg",
            "price": "S/ 29.90"
          }
        ]
      }
    },
    {
      "id": "birthday_offer",
      "type": "promo_banner",
      "version": 1,
      "props": {
        "title": "Bucket fiesta",
        "description": "12 piezas + 4 bebidas a S/ 69.90. Válido solo hoy.",
        "imageUrl": "https://delosi-pidelo.s3.amazonaws.com/kfc/products/mega-promo-8-piezas-202602160411187422.jpg",
        "badge": "SOLO HOY"
      }
    }
  ],
  "meta": {
    "title": "KFC Perú - Inicio",
    "description": "Vista Cumpleaños."
  }
}$json$::jsonb
  )
on conflict (id) do update
  set name        = excluded.name,
      description = excluded.description,
      screen      = excluded.screen;

-- 2. Retire views that are no longer in the fixtures (e.g. the A–D presets)
update public.demo_users
   set variant_id = 'logged'
 where variant_id not in ('guest', 'logged', 'loyalty', 'christmas', 'heavy', 'birthday');

delete from public.variants
 where id not in ('guest', 'logged', 'loyalty', 'christmas', 'heavy', 'birthday');

-- 3. Bottom bar initiatives (feature flags)
insert into public.initiatives (id, name, description, priority, audience, enabled, enabled_by_default, section)
values
  (
    'incident',
    'Aviso de incidencia',
    'Avisa a todas las vistas de un problema operativo. No se puede cerrar.',
    1,
    null,
    false,
    false,
    $json${
  "id": "bottom_bar_incident",
  "type": "bottom_bar",
  "version": 1,
  "props": {
    "title": "Tenemos demoras en delivery",
    "message": "Algunas zonas tienen retrasos. El recojo en tienda funciona con normalidad.",
    "variant": "warning",
    "icon": "warning",
    "isDismissible": false
  }
}$json$::jsonb
  ),
  (
    'address',
    'Pedir dirección al abrir la app',
    'Pide la dirección de entrega apenas se abre la Home, en todas las vistas.',
    2,
    null,
    false,
    false,
    $json${
  "id": "bottom_bar_address",
  "type": "bottom_bar",
  "version": 1,
  "props": {
    "title": "¿Dónde te llevamos tu pedido?",
    "message": "Agrega tu dirección para ver precios y tiempos de tu zona.",
    "cta": {
      "label": "Agregar"
    },
    "variant": "dark",
    "icon": "map-pin",
    "isDismissible": true
  }
}$json$::jsonb
  ),
  (
    'register',
    'Invitar a registrarse',
    'Invita a crear una cuenta a quien navega sin sesión.',
    3,
    array['guest']::text[],
    true,
    true,
    $json${
  "id": "bottom_bar_register",
  "type": "bottom_bar",
  "version": 1,
  "props": {
    "title": "Crea tu cuenta y llévate 10% en tu primer pedido",
    "cta": {
      "label": "Registrarme",
      "actions": {
        "onPress": [
          {
            "type": "NAVIGATE",
            "payload": {
              "url": "/ingresar"
            }
          }
        ]
      }
    },
    "variant": "brand",
    "icon": "gift",
    "isDismissible": true
  }
}$json$::jsonb
  )
on conflict (id) do update
  set name               = excluded.name,
      description        = excluded.description,
      priority           = excluded.priority,
      audience           = excluded.audience,
      enabled_by_default = excluded.enabled_by_default,
      section            = excluded.section;

delete from public.initiatives
 where id not in ('incident', 'address', 'register');
