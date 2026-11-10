// File: coursesData.js

const coursesData = [

    // Ved Study Courses
    {
        id: 1,
        category: 'ved',
        image: '/images/Rigveda.jpg',
        badge: { type: 'popular', text: 'लोकप्रिय' },
        rating: 4.9,
        title: 'ऋग्वेद अध्ययन',
        description: 'ऋग्वेद के मूल मंत्रों का गहन अध्ययन और उनका अर्थ।',
        stats: [
            { icon: 'fas fa-clock', label: '40 घंटे' },
            { icon: 'fas fa-users', label: '1,500 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹3,999',
        currentPrice: '₹2,499'
    },
    {
        id: 2,
        category: 'ved',
        image: '/images/Yajurveda.jpg',
        badge: { type: 'new', text: 'नया' },
        rating: 4.8,
        title: 'यजुर्वेद अध्ययन',
        description: 'यजुर्वेद के यज्ञों और विधियों का विस्तृत अध्ययन।',
        stats: [
            { icon: 'fas fa-clock', label: '35 घंटे' },
            { icon: 'fas fa-users', label: '1,200 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹3,499',
        currentPrice: '₹2,199'
    },
    {
        id: 3,
        category: 'ved',
        image: '/images/Samveda.jpg',
        badge: { type: 'trending', text: 'ट्रेंडिंग' },
        rating: 4.9,
        title: 'सामवेद अध्ययन',
        description: 'सामवेद के मंत्रों के संगीतमय पाठ और भावार्थ का अध्ययन।',
        stats: [
            { icon: 'fas fa-clock', label: '30 घंटे' },
            { icon: 'fas fa-users', label: '1,000 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹2,999',
        currentPrice: '₹1,999'
    },
    {
        id: 4,
        category: 'ved',
        image: '/images/AtharvaVeda.jpg',
        badge: { type: 'special', text: 'विशेष' },
        rating: 4.7,
        title: 'अथर्ववेद अध्ययन',
        description: 'अथर्ववेद के जीवनोपयोगी मंत्रों और औषधीय ज्ञान का अध्ययन।',
        stats: [
            { icon: 'fas fa-clock', label: '25 घंटे' },
            { icon: 'fas fa-users', label: '900 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹2,499',
        currentPrice: '₹1,799'
    },

    // Vedang Study Courses
    {
        id: 5,
        category: 'vedang',
        image: '/images/ShikshaVedang.jpg',
        badge: { type: 'new', text: 'नवीनतम' },
        rating: 4.8,
        title: 'शिक्षा',
        description: 'उच्चारण, स्वर और वेद मंत्रों की सही ध्वनि का अध्ययन।',
        stats: [
            { icon: 'fas fa-clock', label: '30 घंटे' },
            { icon: 'fas fa-users', label: '1,100 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹3,199',
        currentPrice: '₹2,099'
    },
    {
        id: 6,
        category: 'vedang',
        image: '/images/KalpVedang.jpg',
        badge: { type: 'popular', text: 'लोकप्रिय' },
        rating: 4.9,
        title: 'कल्प',
        description: 'वेदों से संबंधित अनुष्ठान, यज्ञ और नियमों का अध्ययन।',
        stats: [
            { icon: 'fas fa-clock', label: '28 घंटे' },
            { icon: 'fas fa-users', label: '950 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹3,499',
        currentPrice: '₹2,299'
    },
    {
        id: 7,
        category: 'vedang',
        image: '/images/VyakaranVedang.jpg',
        badge: { type: 'trending', text: 'ट्रेंडिंग' },
        rating: 4.9,
        title: 'व्याकरण',
        description: 'संस्कृत व्याकरण और वेद मंत्रों की संरचना का गहन अध्ययन।',
        stats: [
            { icon: 'fas fa-clock', label: '35 घंटे' },
            { icon: 'fas fa-users', label: '1,300 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹3,799',
        currentPrice: '₹2,499'
    },
    {
        id: 8,
        category: 'vedang',
        image: '/images/NiruktVedang.jpg',
        badge: { type: 'special', text: 'विशेष' },
        rating: 4.7,
        title: 'निरुक्त',
        description: 'वेदों के कठिन शब्दों और उनके व्युत्पत्ति का अध्ययन।',
        stats: [
            { icon: 'fas fa-clock', label: '26 घंटे' },
            { icon: 'fas fa-users', label: '800 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹2,999',
        currentPrice: '₹1,999'
    },
    {
        id: 9,
        category: 'vedang',
        image: '/images/ChhandVedang.jpg',
        badge: { type: 'popular', text: 'लोकप्रिय' },
        rating: 4.8,
        title: 'छन्द',
        description: 'वेदों के मंत्रों में प्रयुक्त विभिन्न छन्दों का अध्ययन।',
        stats: [
            { icon: 'fas fa-clock', label: '32 घंटे' },
            { icon: 'fas fa-users', label: '1,050 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹3,299',
        currentPrice: '₹2,099'
    },
    {
        id: 10,
        category: 'vedang',
        image: '/images/JyotishVedang.jpg',
        badge: { type: 'new', text: 'नया' },
        rating: 4.9,
        title: 'ज्योतिष',
        description: 'ग्रह-नक्षत्रों, पंचांग और समय-निर्धारण का अध्ययन。',
        stats: [
            { icon: 'fas fa-clock', label: '34 घंटे' },
            { icon: 'fas fa-users', label: '1,200 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹3,599',
        currentPrice: '₹2,299'
    },

    // Upanishad Study Courses
    {
        id: 11,
        category: 'upanishad',
        image: '/images/Ishopanishad.jpg',
        badge: { type: 'new', text: 'नवीनतम' },
        rating: 4.8,
        title: 'ईशोपनिषद्',
        description: 'संपूर्ण ब्रह्मांड में ईश्वर की सर्वव्यापकता का अध्ययन।',
        stats: [
            { icon: 'fas fa-clock', label: '20 घंटे' },
            { icon: 'fas fa-users', label: '800 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹2,499',
        currentPrice: '₹1,799'
    },
    {
        id: 12,
        category: 'upanishad',
        image: '/images/Kenopanishad.jpg',
        badge: { type: 'popular', text: 'लोकप्रिय' },
        rating: 4.9,
        title: 'केनोपनिषद्',
        description: 'ज्ञान का स्रोत और आत्मा की प्रकृति पर आधारित शिक्षा।',
        stats: [
            { icon: 'fas fa-clock', label: '22 घंटे' },
            { icon: 'fas fa-users', label: '950 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹2,699',
        currentPrice: '₹1,899'
    },
    {
        id: 13,
        category: 'upanishad',
        image: '/images/Kathopanishad.jpg',
        badge: { type: 'trending', text: 'प्रचलित' },
        rating: 4.8,
        title: 'कठोपनिषद्',
        description: 'यम और नचिकेता के संवाद से मृत्यु और अमरत्व का ज्ञान।',
        stats: [
            { icon: 'fas fa-clock', label: '28 घंटे' },
            { icon: 'fas fa-users', label: '1,050 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹2,999',
        currentPrice: '₹2,099'
    },
    {
        id: 14,
        category: 'upanishad',
        image: '/images/Prashnopanishad.jpg',
        badge: { type: 'special', text: 'विशेष' },
        rating: 4.7,
        title: 'प्रश्नोपनिषद्',
        description: 'छः प्रश्नों के माध्यम से ब्रह्मविद्या का गहन विश्लेषण。',
        stats: [
            { icon: 'fas fa-clock', label: '24 घंटे' },
            { icon: 'fas fa-users', label: '870 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹2,499',
        currentPrice: '₹1,799'
    },
    {
        id: 15,
        category: 'upanishad',
        image: '/images/Aitareyopanishad.jpg',
        badge: { type: 'popular', text: 'लोकप्रिय' },
        rating: 4.6,
        title: 'ऐतरेयोपनिषद्',
        description: 'जीवन की उत्पत्ति और आत्मा के स्वरूप का विश्लेषण。',
        stats: [
            { icon: 'fas fa-clock', label: '18 घंटे' },
            { icon: 'fas fa-users', label: '720 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹2,199',
        currentPrice: '₹1,599'
    },
    {
        id: 16,
        category: 'upanishad',
        image: '/images/Taittireyopanishad.jpg',
        badge: { type: 'new', text: 'नया' },
        rating: 4.7,
        title: 'तैत्तिरीयोपनिषद्',
        description: 'पाँच कोश सिद्धांत और आत्मसाक्षात्कार का मार्ग।',
        stats: [
            { icon: 'fas fa-clock', label: '26 घंटे' },
            { icon: 'fas fa-users', label: '930 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹2,799',
        currentPrice: '₹1,999'
    },
    {
        id: 17,
        category: 'upanishad',
        image: '/images/Mundakopanishad.jpg',
        badge: { type: 'trending', text: 'प्रचलित' },
        rating: 4.7,
        title: 'मुण्डकोपनिषद्',
        description: 'विद्या और अविद्या के भेद तथा आत्मज्ञान का महत्व。',
        stats: [
            { icon: 'fas fa-clock', label: '35 घंटे' },
            { icon: 'fas fa-users', label: '1,300 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹3,499',
        currentPrice: '₹2,399'
    },
    {
        id: 18,
        category: 'upanishad',
        image: '/images/Mandukyopanishad.jpg',
        badge: { type: 'special', text: 'विशेष' },
        rating: 4.8,
        title: 'माण्डूक्योपनिषद्',
        description: 'ओंकार के चार पदों और चेतना के स्तरों का अध्ययन。',
        stats: [
            { icon: 'fas fa-clock', label: '16 घंटे' },
            { icon: 'fas fa-users', label: '650 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹1,999',
        currentPrice: '₹1,499'
    },
    {
        id: 19,
        category: 'upanishad',
        image: '/images/Shvetashvataropanishad.jpg',
        badge: { type: 'popular', text: 'लोकप्रिय' },
        rating: 4.7,
        title: 'श्वेताश्वतरोपनिषद्',
        description: 'भक्ति, ईश्वर और सृष्टि के रहस्यों का अद्भुत विवेचन。',
        stats: [
            { icon: 'fas fa-clock', label: '29 घंटे' },
            { icon: 'fas fa-users', label: '980 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹2,899',
        currentPrice: '₹2,099'
    },
    {
        id: 20,
        category: 'upanishad',
        image: '/images/Brihadaranyakopanishad.jpg',
        badge: { type: 'important', text: 'महत्वपूर्ण' },
        rating: 4.9,
        title: 'बृहदारण्यकोपनिषद्',
        description: 'आत्मज्ञान, मोक्ष और अद्वैत वेदांत का महान ग्रंथ。',
        stats: [
            { icon: 'fas fa-clock', label: '40 घंटे' },
            { icon: 'fas fa-users', label: '1,500 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹3,799',
        currentPrice: '₹2,599'
    },

    // Darshan Shastra Courses
    {
        id: 21,
        category: 'darshan',
        image: '/images/SankhyaDarshan.jpg',
        badge: { type: 'popular', text: 'लोकप्रिय' },
        rating: 4.8,
        title: 'सांख्य दर्शन',
        description: 'प्रकृति और पुरुष के सिद्धांतों का दार्शनिक अध्ययन।',
        stats: [
            { icon: 'fas fa-clock', label: '28 घंटे' },
            { icon: 'fas fa-users', label: '1,200 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹3,199',
        currentPrice: '₹2,199'
    },
    {
        id: 22,
        category: 'darshan',
        image: '/images/YogDarshan.jpg',
        badge: { type: 'popular', text: 'लोकप्रिय' },
        rating: 4.9,
        title: 'योग दर्शन',
        description: 'पतंजलि के अष्टांग योग पर आधारित आध्यात्मिक साधना।',
        stats: [
            { icon: 'fas fa-clock', label: '30 घंटे' },
            { icon: 'fas fa-users', label: '1,500 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹3,499',
        currentPrice: '₹2,499'
    },
    {
        id: 23,
        category: 'darshan',
        image: '/images/NyayaDarshan.jpg',
        badge: { type: 'popular', text: 'लोकप्रिय' },
        rating: 4.7,
        title: 'न्याय दर्शन',
        description: 'तार्किक विचार और प्रमाण के साधनों का अध्ययन।',
        stats: [
            { icon: 'fas fa-clock', label: '26 घंटे' },
            { icon: 'fas fa-users', label: '900 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹2,999',
        currentPrice: '₹1,999'
    },
    {
        id: 24,
        category: 'darshan',
        image: '/images/VaisheshikDarshan.jpg',
        badge: { type: 'popular', text: 'लोकप्रिय' },
        rating: 4.6,
        title: 'वैशेषिक दर्शन',
        description: 'पदार्थ और उसकी श्रेणियों का दार्शनिक विवेचन।',
        stats: [
            { icon: 'fas fa-clock', label: '25 घंटे' },
            { icon: 'fas fa-users', label: '800 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹2,899',
        currentPrice: '₹1,899'
    },
    {
        id: 25,
        category: 'darshan',
        image: '/images/MimansaDarshan.jpg',
        badge: { type: 'popular', text: 'लोकप्रिय' },
        rating: 4.8,
        title: 'मीमांसा दर्शन',
        description: 'वेदों के कर्मकांड और धर्मशास्त्र का विश्लेषण।',
        stats: [
            { icon: 'fas fa-clock', label: '27 घंटे' },
            { icon: 'fas fa-users', label: '950 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹3,099',
        currentPrice: '₹2,099'
    },
    {
        id: 26,
        category: 'darshan',
        image: '/images/VedantDarshan.jpg',
        badge: { type: 'popular', text: 'लोकप्रिय' },
        rating: 4.9,
        title: 'वेदान्त दर्शन',
        description: 'ब्रह्म, आत्मा और मोक्ष के अद्वैत सिद्धांत का अध्ययन।',
        stats: [
            { icon: 'fas fa-clock', label: '32 घंटे' },
            { icon: 'fas fa-users', label: '1,700 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹3,599',
        currentPrice: '₹2,499'
    },

    // Another Arsh Granth 
    {
        id: 31,
        category: 'aarshgrantha',
        image: '/images/BhagavadGita.jpg',
        badge: { type: 'popular', text: 'लोकप्रिय' },
        rating: 4.9,
        title: 'भगवद्गीता',
        description: 'श्रीमद्भगवद्गीता के श्लोकों का गहन अध्ययन एवं व्याख्या।',
        stats: [
            { icon: 'fas fa-clock', label: '32 घंटे' },
            { icon: 'fas fa-users', label: '1,500 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹3,499',
        currentPrice: '₹2,499'
    },
    {
        id: 32,
        category: 'aarshgrantha',
        image: '/images/Manusmriti.jpg',
        badge: { type: 'none', text: '' },
        rating: 4.7,
        title: 'मनुस्मृति',
        description: 'प्राचीन भारतीय विधि और सामाजिक व्यवस्था का अध्ययन।',
        stats: [
            { icon: 'fas fa-clock', label: '26 घंटे' },
            { icon: 'fas fa-users', label: '900 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹2,999',
        currentPrice: '₹1,999'
    },
    {
        id: 33,
        category: 'aarshgrantha',
        image: '/images/SatyarthPrakash.jpg',
        badge: { type: 'none', text: '' },
        rating: 4.8,
        title: 'सत्यार्थ प्रकाश',
        description: 'महर्षि दयानंद सरस्वती द्वारा रचित सत्य के मार्गदर्शन हेतु ग्रंथ।',
        stats: [
            { icon: 'fas fa-clock', label: '20 घंटे' },
            { icon: 'fas fa-users', label: '750 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹2,499',
        currentPrice: '₹1,599'
    },
    {
        id: 34,
        category: 'aarshgrantha',
        image: '/images/SanskarVidhi.jpg',
        badge: { type: 'none', text: '' },
        rating: 4.6,
        title: 'संस्कार विधि',
        description: 'वेदिक संस्कारों की विधि एवं महत्व का अध्ययन।',
        stats: [
            { icon: 'fas fa-clock', label: '18 घंटे' },
            { icon: 'fas fa-users', label: '600 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹1,999',
        currentPrice: '₹1,299'
    },
    {
        id: 35,
        category: 'aarshgrantha',
        image: '/images/RigvedadibhashyaBhumika.jpg',
        badge: { type: 'none', text: '' },
        rating: 4.8,
        title: 'ऋग्वेदादिभाष्यभूमिका',
        description: 'ऋग्वेद के भाव एवं भाषा का गहन विश्लेषण।',
        stats: [
            { icon: 'fas fa-clock', label: '24 घंटे' },
            { icon: 'fas fa-users', label: '700 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹2,799',
        currentPrice: '₹1,899'
    },
    {
        id: 36,
        category: 'aarshgrantha',
        image: '/images/YagyavalkyaSmriti.jpg',
        badge: { type: 'none', text: '' },
        rating: 4.7,
        title: 'याज्ञवल्क्य स्मृति',
        description: 'प्राचीन भारतीय विधि के प्रमुख ग्रंथों में से एक का अध्ययन।',
        stats: [
            { icon: 'fas fa-clock', label: '22 घंटे' },
            { icon: 'fas fa-users', label: '650 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹2,499',
        currentPrice: '₹1,699'
    },
    {
        id: 37,
        category: 'aarshgrantha',
        image: '/images/KautilyaArthashastra.jpg',
        badge: { type: 'none', text: '' },
        rating: 4.9,
        title: 'कौटिल्य अर्थशास्त्र',
        description: 'राजनीति, अर्थशास्त्र और प्रशासन के प्राचीन सिद्धांत।',
        stats: [
            { icon: 'fas fa-clock', label: '30 घंटे' },
            { icon: 'fas fa-users', label: '1,100 छात्र' },
            { icon: 'fas fa-certificate', label: 'प्रमाणपत्र' }
        ],
        originalPrice: '₹3,299',
        currentPrice: '₹2,299'
    }
];



export default coursesData;
