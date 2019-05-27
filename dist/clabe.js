//! CLABE Validator v1.3.5 ~ github.com/center-key/clabe-validator ~ MIT License

const clabe = {

   version: '1.3.5',

   computeChecksum: (clabeNum17) => {
      // Returns the checksum calculated from the first 17 characters of CLABE number.
      // Example:
      //    const checksum = clabe.computeChecksum('00201007777777777');  //value: 1
      const add = (sum, digit, i) => sum + (parseInt(digit) * [3, 7, 1][i % 3]) % 10;
      const compute = () => (10 - (clabeNum17.split('').slice(0, 17).reduce(add, 0) % 10)) % 10;
      return /^[0-9]{17,18}$/.test(clabeNum17) ? compute() : null;
      },

   validate: (clabeNum) => {
      // Returns information in a map (object literal) about the CLABE number.
      // Example:
      //    const city = clabe.validate('002010077777777771').city;  //value: "Banco Nacional de México"
      const errorMap = {
         length:     'Must be exactly 18 digits long',
         characters: 'Must be only numeric digits (no letters)',
         checksum:   'Invalid checksum, last digit should be: ',
         bank:       'Invalid bank code: ',
         city:       'Invalid city code: '
         };
      if (typeof clabeNum !== 'string')
         throw 'clabe.validator.check(clabeNum) -- Expected string, got: ' + typeof clabeNum;
      const bankCode = clabeNum.substring(0, 3);
      const cityCode = clabeNum.substring(3, 6);
      const account =  clabeNum.substring(6, 17);
      const checksum = parseInt(clabeNum.substring(17, 18));
      const makeCitiesMap = () => {
         clabe.citiesMap = {};
         const prefix = (code) => clabe.citiesMap[code] ? clabe.citiesMap[code] + ', ' : '';
         const addCity = (city) => clabe.citiesMap[city[0]] = prefix(city[0]) + city[1];  //0: code, 1: name
         clabe.cities.forEach(addCity);
         };
      if (!clabe.citiesMap)
         makeCitiesMap();
      const bank = clabe.banksMap[parseInt(bankCode)] || {};
      const city = clabe.citiesMap[parseInt(cityCode)];
      const realChecksum = clabe.computeChecksum(clabeNum);
      const getValidationInfo = () => {
         const validationInfo =
            clabeNum.length !== 18 ?    { invalid: 'length',     data: '' } :
            /[^0-9]/.test(clabeNum) ?   { invalid: 'characters', data: '' } :
            checksum !== realChecksum ? { invalid: 'checksum',   data: realChecksum } :
            !bank.tag ?                 { invalid: 'bank',       data: bankCode } :
            !city ?                     { invalid: 'city',       data: cityCode } :
            { invalid: null };
         return validationInfo;
         };
      const validation = getValidationInfo();
      const valid = !validation.invalid;
      return {
         ok:       valid,
         error:    valid ? null : 'invalid-' + validation.invalid,
         formatOk: valid || ['bank', 'city'].includes(validation.invalid),
         message:  valid ? 'Valid' : errorMap[validation.invalid] + validation.data,
         tag:      bank.tag,
         bank:     bank.name,
         city:     city,
         account:  account,
         code:     { bank: bankCode, city: cityCode },
         checksum: realChecksum
         };
      },

   calculate: (bankCode, cityCode, accountNumber) => {
      // Returns an 18-character CLABE number.
      // Example:
      //    const clabeNum = clabe.calculate(2, 10, 7777777777);  //value: "002010077777777771"
      const pad = (num, len) => num.length < len ? pad('0' + num, len) : num;
      const fit = (num, len) => pad('' + num, len).slice(-len);
      const clabeNum = fit(bankCode, 3) + fit(cityCode, 3) + fit(accountNumber, 11);
      return clabeNum + clabe.computeChecksum(clabeNum);
      },

   banksMap: {  //source: https://es.wikipedia.org/wiki/CLABE#C.C3.B3digo_de_banco (Jan 9, 2017)
        2: { tag: 'BANAMEX',               name: 'Banco Nacional de México, S.A.' },
        6: { tag: 'BANCOMEXT',             name: 'Banco Nacional de Comercio Exterior' },
        9: { tag: 'BANOBRAS',              name: 'Banco Nacional de Obras y Servicios Públicos' },
       12: { tag: 'BBVA BANCOMER',         name: 'BBVA Bancomer, S.A.' },
       14: { tag: 'SANTANDER',             name: 'Banco Santander, S.A.' },
       19: { tag: 'BANJERCITO',            name: 'Banco Nacional del Ejército, Fuerza Aérea y Armada' },
       21: { tag: 'HSBC',                  name: 'HSBC México, S.A.' },
       22: { tag: 'GE MONEY',              name: 'GE Money Bank, S.A.' },
       30: { tag: 'BAJÍO',                 name: 'Banco del Bajío, S.A.' },
       32: { tag: 'IXE',                   name: 'IXE Banco, S.A.' },
       36: { tag: 'INBURSA',               name: 'Banco Inbursa, S.A.' },
       37: { tag: 'INTERACCIONES',         name: 'Banco Interacciones, S.A.' },
       42: { tag: 'MIFEL',                 name: 'Banca Mifel, S.A.' },
       44: { tag: 'SCOTIABANK',            name: 'Scotiabank Inverlat, S.A.' },
       58: { tag: 'BANREGIO',              name: 'Banco Regional de Monterrey, S.A.' },
       59: { tag: 'INVEX',                 name: 'Banco Invex, S.A.' },
       60: { tag: 'BANSI',                 name: 'Bansi, S.A.' },
       62: { tag: 'AFIRME',                name: 'Banca Afirme, S.A.' },
       72: { tag: 'BANORTE',               name: 'Banco Mercantil del Norte, S.A.' },
      102: { tag: 'ABNAMRO',               name: 'ABN AMRO Bank México, S.A.' },
      103: { tag: 'AMERICAN EXPRESS',      name: 'American Express Bank (México), S.A.' },
      106: { tag: 'BAMSA',                 name: 'Bank of America México, S.A.' },
      108: { tag: 'TOKYO',                 name: 'Bank of Tokyo-Mitsubishi UFJ (México), S.A.' },
      110: { tag: 'JP MORGAN',             name: 'Banco J.P. Morgan, S.A.' },
      112: { tag: 'BMONEX',                name: 'Banco Monex, S.A.' },
      113: { tag: 'VE POR MAS',            name: 'Banco Ve por Mas, S.A.' },
      116: { tag: 'ING',                   name: 'ING Bank (México), S.A.' },
      124: { tag: 'DEUTSCHE',              name: 'Deutsche Bank México, S.A.' },
      126: { tag: 'CREDIT SUISSE',         name: 'Banco Credit Suisse (México), S.A.' },
      127: { tag: 'AZTECA',                name: 'Banco Azteca, S.A.' },
      128: { tag: 'AUTOFIN',               name: 'Banco Autofin México, S.A.' },
      129: { tag: 'BARCLAYS',              name: 'Barclays Bank México, S.A.' },
      130: { tag: 'COMPARTAMOS',           name: 'Banco Compartamos, S.A.' },
      131: { tag: 'FAMSA',                 name: 'Banco Ahorro Famsa, S.A.' },
      132: { tag: 'BMULTIVA',              name: 'Banco Multiva, S.A.' },
      133: { tag: 'PRUDENTIAL',            name: 'Prudencial Bank, S.A.' },
      134: { tag: 'WAL-MART',              name: 'Banco Wal Mart de México Adelante, S.A.' },
      135: { tag: 'NAFIN',                 name: 'Nacional Financiera, S.N.C.' },
      136: { tag: 'REGIONAL',              name: 'Banco Regional, S.A.' },
      137: { tag: 'BANCOPPEL',             name: 'BanCoppel, S.A.' },
      138: { tag: 'ABC CAPITAL',           name: 'ABC Capital, S.A. I.B.M.' },
      139: { tag: 'UBS BANK',              name: 'UBS Banco, S.A.' },
      140: { tag: 'FÁCIL',                 name: 'Banco Fácil, S.A.' },
      141: { tag: 'VOLKSWAGEN',            name: 'Volkswagen Bank S.A. Institución de Banca Múltiple' },
      143: { tag: 'CIBANCO',               name: 'Consultoría Internacional Banco, S.A.' },
      145: { tag: 'BBASE',                 name: 'Banco BASE, S.A. de I.B.M.' },
      147: { tag: 'BANKAOOL',              name: 'Bankaool, S.A., Institución de Banca Múltiple' },
      148: { tag: 'PAGATODO',              name: 'Banco PagaTodo S.A., Institución de Banca Múltiple' },
      150: { tag: 'BIM',                   name: 'Banco Inmobiliario Mexicano, S.A., Institución de Banca Múltiple' },
      152: { tag: 'BANCREA',               name: 'Banco Bancrea, S.A., Institución de Banca Múltiple' },
      156: { tag: 'SABADELL',              name: 'Banco Sabadell, S.A. I.B.M.' },
      166: { tag: 'BANSEFI',               name: 'Banco del Ahorro Nacional y Servicios Financieros, S.N.C.' },
      168: { tag: 'HIPOTECARIA FEDERAL',   name: 'Sociedad Hipotecaria Federal, S.N.C.' },
      600: { tag: 'MONEXCB',               name: 'Monex Casa de Bolsa, S.A. de C.V.' },
      601: { tag: 'GBM',                   name: 'GBM Grupo Bursátil Mexicano, S.A. de C.V.' },
      602: { tag: 'MASARI CC.',            name: 'Masari Casa de Cambio, S.A. de C.V.' },
      604: { tag: 'C.B. INBURSA',          name: 'Inversora Bursátil, S.A. de C.V.' },
      605: { tag: 'VALUÉ',                 name: 'Valué, S.A. de C.V., Casa de Bolsa' },
      606: { tag: 'CB BASE',               name: 'Base Internacional Casa de Bolsa, S.A. de C.V.' },
      607: { tag: 'TIBER',                 name: 'Casa de Cambio Tiber, S.A. de C.V.' },
      608: { tag: 'VECTOR',                name: 'Vector Casa de Bolsa, S.A. de C.V.' },
      610: { tag: 'B&B',                   name: 'B y B Casa de Cambio, S.A. de C.V.' },
      611: { tag: 'INTERCAM',              name: 'Intercam Casa de Cambio, S.A. de C.V.' },
      613: { tag: 'MULTIVA',               name: 'Multivalores Casa de Bolsa, S.A. de C.V. Multiva Gpo. Fin.' },
      614: { tag: 'ACCIVAL',               name: 'Acciones y Valores Banamex, S.A. de C.V., Casa de Bolsa' },
      615: { tag: 'MERRILL LYNCH',         name: 'Merrill Lynch México, S.A. de C.V., Casa de Bolsa' },
      616: { tag: 'FINAMEX',               name: 'Casa de Bolsa Finamex, S.A. de C.V.' },
      617: { tag: 'VALMEX',                name: 'Valores Mexicanos Casa de Bolsa, S.A. de C.V.' },
      618: { tag: 'ÚNICA',                 name: 'Única Casa de Cambio, S.A. de C.V.' },
      619: { tag: 'ASEGURADORA MAPFRE',    name: 'MAPFRE Tepeyac S.A.' },
      620: { tag: 'AFORE PROFUTURO',       name: 'Profuturo G.N.P., S.A. de C.V.' },
      621: { tag: 'CB ACTINBER',           name: 'Actinver Casa de Bolsa, S.A. de C.V.' },
      622: { tag: 'ACTINVE SI',            name: 'Actinver S.A. de C.V.' },
      623: { tag: 'SKANDIA',               name: 'Skandia Vida S.A. de C.V.' },
      624: { tag: 'CONSULTORÍA',           name: 'Consultoría Internacional Casa de Cambio, S.A. de C.V.' },
      626: { tag: 'CBDEUTSCHE',            name: 'Deutsche Securities, S.A. de C.V.' },
      627: { tag: 'ZURICH',                name: 'Zurich Compañía de Seguros, S.A.' },
      628: { tag: 'ZURICHVI',              name: 'Zurich Vida, Compañía de Seguros, S.A.' },
      629: { tag: 'HIPOTECARIA SU CASITA', name: 'Hipotecaria su Casita, S.A. de C.V.' },
      630: { tag: 'C.B. INTERCAM',         name: 'Intercam Casa de Bolsa, S.A. de C.V.' },
      631: { tag: 'C.B. VANGUARDIA',       name: 'Vanguardia Casa de Bolsa, S.A. de C.V.' },
      632: { tag: 'BULLTICK C.B.',         name: 'Bulltick Casa de Bolsa, S.A. de C.V.' },
      633: { tag: 'STERLING',              name: 'Sterling Casa de Cambio, S.A. de C.V.' },
      634: { tag: 'FINCOMUN',              name: 'Fincomún, Servicios Financieros Comunitarios, S.A. de C.V.' },
      636: { tag: 'HDI SEGUROS',           name: 'HDI Seguros, S.A. de C.V.' },
      637: { tag: 'ORDER',                 name: 'OrderExpress Casa de Cambio , S.A. de C.V. AAC' },
      638: { tag: 'AKALA',                 name: 'Akala, S.A. de C.V., Sociedad Financiera Popular' },
      640: { tag: 'JP MORGAN C.B.',        name: 'J.P. Morgan Casa de Bolsa, S.A. de C.V.' },
      642: { tag: 'REFORMA',               name: 'Operadora de Recursos Reforma, S.A. de C.V.' },
      646: { tag: 'STP',                   name: 'Sistema de Transferencias y Pagos STP, S.A. de C.V., SOFOM E.N.R.' },
      647: { tag: 'TELECOMM',              name: 'Telecomunicaciones de México' },
      648: { tag: 'EVERCORE',              name: 'Evercore Casa de Bolsa, S.A. de C.V.' },
      649: { tag: 'SKANDIA',               name: 'Skandia Operadora S.A. de C.V.' },
      651: { tag: 'SEGMTY',                name: 'Seguros Monterrey New York Life, S.A de C.V.' },
      652: { tag: 'ASEA',                  name: 'Solución Asea, S.A. de C.V., Sociedad Financiera Popular' },
      653: { tag: 'KUSPIT',                name: 'Kuspit Casa de Bolsa, S.A. de C.V.' },
      655: { tag: 'SOFIEXPRESS',           name: 'J.P. SOFIEXPRESS, S.A. de C.V., S.F.P.' },
      656: { tag: 'UNAGRA',                name: 'UNAGRA, S.A. de C.V., S.F.P.' },
      659: { tag: 'OPCIONES EMPRESARIALES DEL NOROESTE', name: 'Opciones Empresariales Del Noreste, S.A. DE C.V.' },
      670: { tag: 'LIBERTAD',              name: 'Libertad Servicios Financieros, S.A. De C.V.' },
      846: { tag: 'STP',                   name: 'Sistema de Transferencias y Pagos STP'},
      901: { tag: 'CLS',                   name: 'CLS Bank International' },
      902: { tag: 'INDEVAL',               name: 'SD. INDEVAL, S.A. de C.V.' },
      999: { tag: 'N/A',                   name: 'N/A' }
      },

   cities: [  //source: https://es.wikipedia.org/wiki/CLABE#C.C3.B3digo_de_plaza (Jan 9, 2017)
      [ 10, 'Aguascalientes'],
      [ 12, 'Calvillo'],
      [ 14, 'Jesús María'],
      [ 20, 'Mexicali'],
      [ 22, 'Ensenada'],
      [ 27, 'Tecate'],
      [ 27, 'Tijuana'],
      [ 28, 'La Mesa'],
      [ 28, 'Rosarito'],
      [ 28, 'Tijuana [alternate]'],  //see first occurrence at 27
      [ 40, 'La Paz'],
      [ 41, 'Cabo San Lucas'],
      [ 42, 'Ciudad Constitución'],
      [ 43, 'Guerrero Negro'],
      [ 45, 'San José del Cabo'],
      [ 46, 'Santa Rosalía'],
      [ 50, 'Campeche'],
      [ 51, 'Calkiní'],
      [ 52, 'Ciudad del Carmen'],
      [ 53, 'Champotón'],
      [ 60, 'Gómez Palacio'],
      [ 60, 'Torreón'],
      [ 62, 'Ciudad Acuña'],
      [ 68, 'Monclova'],
      [ 71, 'Nava'],
      [ 72, 'Nueva Rosita'],
      [ 74, 'Parras de la Fuente'],
      [ 75, 'Piedras Negras'],
      [ 76, 'Ramos Arizpe'],
      [ 77, 'Sabinas'],
      [ 78, 'Saltillo'],
      [ 80, 'San Pedro de las Colonias'],
      [ 90, 'Colima'],
      [ 95, 'Manzanillo'],
      [ 97, 'Tecomán'],
      [100, 'Terán'],
      [100, 'Tuxtla Gutiérrez'],
      [103, 'Arriaga'],
      [107, 'Cintalapa'],
      [109, 'Comitán'],
      [109, 'Villa Las Rosas'],
      [111, 'Chiapa de Corso'],
      [113, 'F. Comalapa'],
      [114, 'Huixtla'],
      [123, 'Ocosingo'],
      [124, 'Ocozocuautla'],
      [125, 'Palenque'],
      [126, 'Pichucalco'],
      [127, 'Pijijiapan'],
      [128, 'Reforma'],
      [130, 'San Cristóbal de las Casas'],
      [131, 'Simojovel'],
      [133, 'Tapachula'],
      [135, 'Tonala'],
      [137, 'Venustiano Carranza'],
      [138, 'Villa Flores'],
      [140, 'Yajalón'],
      [150, 'Chihuahua'],
      [150, 'Ciudad Delicias'],
      [152, 'Ciudad Anáhuac'],
      [155, 'Ciudad Camargo'],
      [158, 'Ciudad Cuauhtémoc'],
      [161, 'Ciudad Guerrero'],
      [162, 'Parral'],
      [163, 'Ciudad Jiménez'],
      [164, 'Ciudad Juárez'],
      [165, 'Ciudad Madera'],
      [167, 'El Molino de Namiquipa'],
      [168, 'Nuevo Casas Grandes'],
      [180, 'Atizapan'],
      [180, 'Chalco'],
      [180, 'Ciudad de México'],
      [180, 'Coacalco'],
      [180, 'Cuautitlán Izcalli'],
      [180, 'Cuautitlán'],
      [180, 'Ecatepec'],
      [180, 'Huehuetoca'],
      [180, 'Huixquilucan'],
      [180, 'Ixtapaluca'],
      [180, 'Los Reyes La Paz'],
      [180, 'Naucalpan'],
      [180, 'Nezahualcóyotl'],
      [180, 'Tecamac'],
      [180, 'Teotihuacán'],
      [180, 'Texcoco'],
      [180, 'Tlalnepantla'],
      [190, 'Durango'],
      [198, 'N/A'],
      [201, 'Tepehuanes'],
      [202, 'Vicente Guerrero'],
      [210, 'Guanajuato'],
      [211, 'Abasolo'],
      [212, 'Acámbaro'],
      [213, 'Apaseo el Alto'],
      [214, 'Apaseo el Grande'],
      [215, 'Celaya'],
      [216, 'Comonfort'],
      [217, 'Coroneo'],
      [218, 'Cortazar'],
      [219, 'Cuerámaro'],
      [220, 'Dolores Hidalgo'],
      [222, 'Irapuato'],
      [223, 'Jaral del Progreso'],
      [224, 'Jerécuaro'],
      [225, 'León'],
      [226, 'Cd. Manuel Doblado'],
      [227, 'Moroleón'],
      [229, 'Pénjamo'],
      [232, 'Romita'],
      [233, 'Salamanca'],
      [234, 'Salvatierra'],
      [236, 'San Felipe'],
      [237, 'Purísima de Bustos'],
      [237, 'San Francisco del Rincoón'],
      [238, 'San José Iturbide'],
      [239, 'San Luis de la Paz'],
      [240, 'San Miguel Allende'],
      [244, 'Silao'],
      [247, 'Uriangato'],
      [248, 'Valle de Santiago'],
      [249, 'Yuriria'],
      [260, 'Chilpancingo'],
      [261, 'Acapulco'],
      [263, 'Arcelia'],
      [264, 'Atoyac de Álvarez'],
      [266, 'Ciudad Altamirano'],
      [267, 'Coyuca de Benítez'],
      [270, 'Chilapa'],
      [271, 'Huitzuco'],
      [272, 'Iguala'],
      [272, 'La Sabana'],
      [274, 'Cuajinicuilapa'],
      [274, 'Ometepec'],
      [275, 'San Marcos'],
      [276, 'Taxco'],
      [278, 'Teloloapan'],
      [281, 'Tlapa'],
      [282, 'Ixtapa Zihuatanejo'],
      [282, 'Zihuatanejo'],
      [290, 'Pachuca'],
      [291, 'Actopan'],
      [292, 'Apam'],
      [293, 'Atotonilco el Grande'],
      [294, 'Ciudad Sahagún'],
      [294, 'Teocaltiche'],
      [295, 'Cuautepec'],
      [296, 'Huejutla'],
      [297, 'Huichapan'],
      [298, 'Ixmiquilpan'],
      [303, 'Progreso de Obregón'],
      [305, 'Tepeapulco'],
      [308, 'Tizayuca'],
      [311, 'Tula de Allende'],
      [312, 'Tulancingo'],
      [313, 'Zacualtipán'],
      [314, 'Zimapán'],
      [320, 'El Salto'],
      [320, 'Guadalajara'],
      [320, 'San Pedro Tlaquepaque'],
      [320, 'Tlajomulco'],
      [320, 'Tonala [alternate]'],  //see first occurrence at 135
      [320, 'Zapopan'],
      [326, 'Ameca'],
      [327, 'Arandas'],
      [330, 'Atotonilco el Alto'],
      [331, 'Atequiza'],
      [333, 'Autlán'],
      [334, 'Azteca'],
      [340, 'Casimiro Castillo'],
      [341, 'Cihuatlán'],
      [342, 'Ciudad Guzmán'],
      [346, 'Chapala'],
      [348, 'El Grullo'],
      [355, 'Ixtlahuacán del Río'],
      [356, 'Jalostotitlán'],
      [357, 'Jamay'],
      [361, 'La Barca'],
      [362, 'Lagos de Moreno'],
      [370, 'Ocotlán'],
      [373, 'Pihuamo'],
      [375, 'Las Juntas'],
      [375, 'Nuevo Vallarta'],
      [375, 'Pitillal'],
      [375, 'Puerto Vallarta'],
      [381, 'San Juan de los Lagos'],
      [382, 'N/A'],
      [384, 'San Miguel el Alto'],
      [385, 'San Patricio Melaque'],
      [386, 'Sayula'],
      [387, 'Tala'],
      [389, 'Tamazula de Gordiano'],
      [391, 'Tecalitlán'],
      [396, 'Tepatitlán'],
      [397, 'Tequila'],
      [403, 'Tototlán'],
      [404, 'Túxpam'],
      [411, 'Villa Hidalgo'],
      [413, 'Zacoalco de Torres'],
      [414, 'Zapotiltic'],
      [416, 'Zapotlanejo'],
      [420, 'Toluca'],
      [421, 'Acambay'],
      [422, 'Almoloya de Juárez'],
      [424, 'Amecameca'],
      [425, 'Apaxco'],
      [426, 'Atlacomulco'],
      [428, 'Coatepec de Harinas'],
      [430, 'Chicoloapan'],
      [431, 'Chiconcuac'],
      [432, 'El Oro'],
      [433, 'Ixtapan de la Sal'],
      [434, 'Ixtlahuaca'],
      [435, 'Jilotepec'],
      [438, 'Lerma'],
      [441, 'Metepec'],
      [443, 'Otumba'],
      [445, 'San Mateo Atenco'],
      [446, 'Tejupilco'],
      [448, 'Temascaltepec'],
      [449, 'Temoaya'],
      [450, 'Tenancingo'],
      [451, 'Tenago del Valle'],
      [453, 'Santiago Tiangistenco'],
      [455, 'Tultepec'],
      [456, 'Tultitlán'],
      [457, 'Valle de Bravo'],
      [460, 'Villa Nicolás Romero'],
      [463, 'Zumpango'],
      [470, 'Morelia'],
      [472, 'Aguililla'],
      [476, 'Apatzingán'],
      [480, 'Ciudad Hidalgo'],
      [483, 'Cotija'],
      [484, 'Cuitzeo'],
      [492, 'Huetamo'],
      [493, 'Jacona'],
      [494, 'Jiquilpan'],
      [496, 'La Piedad'],
      [497, 'Lázaro Cárdenas'],
      [498, 'Los Reyes'],
      [499, 'Maravatío'],
      [501, 'Nueva Italia'],
      [506, 'Pátzcuaro'],
      [508, 'Purépero'],
      [509, 'Puruandiro'],
      [512, 'Sahuayo'],
      [515, 'Tacámbaro'],
      [517, 'Tangancícuaro'],
      [519, 'Tepalcatepec'],
      [523, 'Tlazazalca'],
      [528, 'Uruapan'],
      [533, 'Yurécuaro'],
      [534, 'Zacapu'],
      [535, 'Zamora'],
      [536, 'Zinapécuaro'],
      [537, 'Zitácuaro'],
      [540, 'Cuernavaca'],
      [542, 'Cuautla'],
      [542, 'Oaxtepec, Morelos'],
      [543, 'Jiutepec'],
      [544, 'Jojutla'],
      [545, 'Puente de Ixtla'],
      [546, 'Temixco'],
      [548, 'Tetecala'],
      [549, 'Yautepec'],
      [552, 'Zacatepec'],
      [560, 'Tepic'],
      [561, 'Acaponeta'],
      [562, 'Ahuacatlán'],
      [564, 'Compostela'],
      [566, 'Ixtlán del Río'],
      [571, 'San Blas'],
      [573, 'Santiago Ixcuintla'],
      [575, 'Túxpam [alternate]'],  //see first occurrence at 404
      [580, 'Apodaca'],
      [580, 'Cadereyta'],
      [580, 'Cd. Guadalupe'],
      [580, 'General Escobedo'],
      [580, 'Monterrey'],
      [580, 'San Nicolás de los Garza'],
      [580, 'San Pedro Garza García'],
      [580, 'Santa Catarina'],
      [583, 'Allende'],
      [592, 'General Zuazua'],
      [595, 'Linares'],
      [597, 'Montemorelos'],
      [599, 'Sabinas Hidalgo'],
      [600, 'Salinas Victoria'],
      [601, 'El Cercado'],
      [601, 'Villa de Santiago'],
      [610, 'Oaxaca'],
      [613, 'Tlaxiaco'],
      [614, 'Huajuapan de León'],
      [616, 'Ixtepec'],
      [617, 'Juchitán'],
      [619, 'Loma Bonita'],
      [620, 'Matías Romero'],
      [621, 'Miahuatlán'],
      [622, 'Ocotlán [alternate]'],  //see first occurrence at 370
      [624, 'Puerto Escondido'],
      [626, 'Salina Cruz'],
      [627, 'Lagunas'],
      [628, 'Tuxtepec'],
      [630, 'Pochutla'],
      [631, 'San Pedro Tapanatepec'],
      [632, 'Santa Lucía del Camino'],
      [634, 'Bahías de Huatulco'],
      [635, 'Santiago Juxtlahuaca'],
      [636, 'Pinotepa Nacional'],
      [637, 'Tehuantepec'],
      [638, 'Tlacolula'],
      [640, 'Zimatlán'],
      [650, 'Cholula'],
      [650, 'La Resurrección'],
      [650, 'Puebla'],
      [650, 'San Baltazar Campeche'],
      [651, 'N/A'],
      [652, 'Acatzingo'],
      [654, 'Atlixco'],
      [656, 'Cuetzalan'],
      [659, 'Huauchinango'],
      [662, 'Izúcar de Matamoros'],
      [667, 'San Martín Texmelucan'],
      [668, 'San Felipe Hueyotlipan'],
      [669, 'Tecamachalco'],
      [670, 'Tehuacán'],
      [671, 'San Lorenzo'],
      [672, 'Teziutlán'],
      [674, 'Xicotepec de Juárez'],
      [676, 'Zacatlán'],
      [680, 'Pedro Escobedo'],
      [680, 'Querétaro'],
      [680, 'Villa Corregidora'],
      [681, 'Amealco'],
      [685, 'San Juan del Río'],
      [686, 'Tequisquiapan'],
      [690, 'Chetumal'],
      [691, 'Cancún'],
      [691, 'Col. Puerto Juárez'],
      [692, 'Cozumel'],
      [693, 'N/A'],
      [694, 'Playa del Carmen'],
      [700, 'San Luis Potosí'],
      [703, 'Cerritos'],
      [705, 'Ciudad Valles'],
      [709, 'Matehuala'],
      [711, 'Río Verde'],
      [716, 'Tamuín'],
      [730, 'Culiacán'],
      [735, 'Concordia'],
      [736, 'Cosala'],
      [737, 'Choix'],
      [738, 'El Fuerte'],
      [739, 'Escuinapa'],
      [740, 'Guamúchil'],
      [741, 'Guasave'],
      [743, 'Los Mochis'],
      [743, 'Topolobampo'],
      [744, 'Mazatlán'],
      [745, 'Mocorito'],
      [746, 'Navolato'],
      [760, 'Hermosillo'],
      [761, 'Agua Prieta'],
      [765, 'Caborca'],
      [766, 'Cananea'],
      [767, 'Ciudad Obregón'],
      [767, 'Esperanza'],
      [769, 'Empalme'],
      [770, 'Guaymas'],
      [770, 'San Carlos'],
      [771, 'Huatabampo'],
      [773, 'Magdalena'],
      [776, 'Nacozari de García'],
      [777, 'Navojoa'],
      [778, 'Nogales'],
      [779, 'Puerto Peñasco'],
      [780, 'San Luis Río Colorado'],
      [790, 'Tamulte'],
      [790, 'Villa Hermosa'],
      [792, 'Cárdenas'],
      [793, 'Ciudad Pemex'],
      [794, 'Comalcalco'],
      [796, 'Emiliano Zapata'],
      [797, 'Frontera'],
      [798, 'Huimanguillo'],
      [800, 'Jalpa de Méndez'],
      [802, 'Macuspana'],
      [803, 'Nacajuca'],
      [804, 'Paraíso'],
      [805, 'Tacotalpa'],
      [806, 'Teapa'],
      [807, 'Tenosique'],
      [810, 'Ciudad Victoria'],
      [811, 'Altamira'],
      [813, 'Ciudad Madero'],
      [813, 'Tampico'],
      [814, 'Ciudad Mante'],
      [818, 'Matamoros'],
      [821, 'Colombia'],
      [821, 'Nuevo Laredo'],
      [822, 'Reynosa'],
      [823, 'Río Bravo'],
      [825, 'Soto La Marina'],
      [826, 'Valle Hermoso'],
      [830, 'Tlaxcala'],
      [832, 'Apizaco'],
      [834, 'Santa Ana Chiautempan'],
      [840, 'Jalapa'],
      [841, 'Acayucan'],
      [843, 'Agua Dulce'],
      [845, 'Álamo'],
      [846, 'Altotonga'],
      [848, 'Banderilla'],
      [849, 'Boca del Río'],
      [852, 'Ciudad Mendoza'],
      [853, 'Coatepec'],
      [854, 'Coatzacoalcos'],
      [855, 'Córdoba'],
      [856, 'Cosamaloapan'],
      [860, 'Cuitláhuac'],
      [863, 'Fortín de las Flores'],
      [864, 'Gutiérrez Zamora'],
      [865, 'Huatusco'],
      [867, 'Isla'],
      [868, 'Ixtaczoquitlán'],
      [869, 'Jáltipan'],
      [871, 'Juan Rodríguez Clara'],
      [872, 'Villa José Cardel'],
      [873, 'Las Choapas'],
      [875, 'Naranjos'],
      [876, 'Martínez de la Torre'],
      [877, 'Minatitlán'],
      [878, 'Misantla'],
      [879, 'Nanchital'],
      [882, 'Orizaba'],
      [885, 'Papantla'],
      [886, 'Perote'],
      [888, 'Poza Rica'],
      [889, 'Río Blanco'],
      [890, 'San Andrés Tuxtla'],
      [891, 'San Rafael'],
      [894, 'Platón Sánchez'],
      [894, 'Tantoyuca'],
      [895, 'Tempoal'],
      [898, 'Tierra Blanca'],
      [901, 'Tlapacoyan'],
      [903, 'Túxpam de Rodríguez Cano'],
      [905, 'Cd. Industrial Framboyan'],
      [905, 'Veracruz'],
      [910, 'Mérida'],
      [913, 'Motul'],
      [914, 'Oxkutzcab'],
      [915, 'Progreso'],
      [917, 'Ticul'],
      [918, 'Tizimín'],
      [920, 'Valladolid'],
      [930, 'Zacatecas'],
      [933, 'Fresnillo'],
      [934, 'Guadalupe'],
      [935, 'Jalpa'],
      [936, 'Jerez de G. Salinas'],
      [938, 'Juchipila'],
      [939, 'Loreto'],
      [946, 'Nochistlán'],
      [958, 'Valparaíso'],
      [960, 'Calera de V. Rosales']
      ]

   };

if (typeof module === 'object')
   module.exports = clabe;  //node module loading system (CommonJS)
if (typeof window === 'object')
   window.clabe = clabe;  //support both global and window property
