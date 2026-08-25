const vocabularyIds = [
  'sw1','sw2','sw3','sw4','sw5','sw6','sw7','sw8','ba1','ba2','ba3','ba4','ba5','ba6','ba7','ba8',
  'me1','me2','me3','me4','me5','me6','me7','me8','fk1','fk2','fk3','fk4','fk5','fk6','fk7','fk8',
  'er1','er2','er3','er4','er5','er6','er7','er8','ge1','ge2','ge3','ge4','ge5','ge6','ge7','ge8',
  'rv1','rv2','rv3','rv4','rv5','rv6','rv7','rv8','ga1','ga2','ga3','ga4','ga5','ga6','ga7','ga8'
];

const meanings = {
  en: [
    'The language someone learns first as a child.','To speak a language confidently with few pauses.','To listen carefully to what someone says.','To explain why something is the case.','To pay regularly to use a home.','To make a home or building attractive again.','Outside a large city, in the countryside.','A strong feeling when someone is afraid.',
    'A teaching session at a university.','What someone thinks about a subject.','To say that you have the same opinion.','To say that you do not want or accept something.','By your own choice, without obligation.','Not dependent on another person.','Documents used to apply for a job.','Knowledge gained through practical activities.',
    'The part of a device that displays images and text.','The device used to type on a computer.','A device that produces sound or music.','To copy a file from the internet to a device.','To send a file from a device to the internet.','To send a message on to another person.','A text, image, or video published in media.','Intended only for one person or a small group.',
    'The story that happens in a film.','The most important person in a story.','A funny film intended to make people laugh.','A story about a crime and its solution.','A short promotional video for a new film.','A short story intended to be funny.','To speak very quietly.','To finish first in a game or competition.',
    'The moment when a child is born.','The test required to receive a driving licence.','To succeed in an examination.','To wish someone well for a happy event.','To thank someone for something.','A message saying that something is cancelled or declined.','The two people who are getting married.','Colourful lights in the sky during a celebration.',
    'Nervous and excited before an important event.','Annoyed because something repeatedly causes trouble.','Very pleased with your own or another person’s achievement.','Unhappy and without joy.','To become angry or dissatisfied about something.','To feel comfortable in a place or situation.','To argue angrily because of different opinions.','To help someone become calm again.',
    'A place where someone sleeps while travelling.','When a bus or train arrives later than planned.','To leave one form of transport and take another.','A ticket for a bus, tram, or train.','Suitcases and bags taken on a journey.','The time when a bus or train leaves.','All the vehicles travelling on roads.','The money used in a particular country.',
    'When a doctor checks someone’s body or health.','A document from a doctor for medicine.','A mild illness with a cough or runny nose.','To take a break so the body can recover.','A shop where medicines are sold.','Health problems or pain.','To agree on an appointment or plan together.','To say that you cannot attend an appointment.'
  ],
  es: [
    'La lengua que una persona aprende primero de niña.','Hablar una lengua con seguridad y pocas pausas.','Escuchar atentamente lo que dice alguien.','Explicar por qué algo es así.','Pagar regularmente por usar una vivienda.','Volver a dejar bonita una vivienda o edificio.','Fuera de una gran ciudad, en el campo.','Un sentimiento fuerte cuando alguien tiene miedo.',
    'Una clase impartida en una universidad.','Lo que alguien piensa sobre un tema.','Decir que se tiene la misma opinión.','Decir que no se desea o acepta algo.','Por decisión propia y sin obligación.','No depender de otra persona.','Documentos para solicitar un empleo.','Conocimientos obtenidos mediante actividades prácticas.',
    'La parte de un aparato que muestra imágenes y texto.','El dispositivo con el que se escribe en el ordenador.','Un aparato que produce sonido o música.','Copiar un archivo de internet a un dispositivo.','Enviar un archivo del dispositivo a internet.','Enviar un mensaje a otra persona.','Un texto, imagen o vídeo publicado en un medio.','Destinado solo a una persona o grupo pequeño.',
    'La historia que sucede en una película.','La persona más importante de una historia.','Una película divertida que hace reír.','Una historia sobre un delito y su solución.','Un vídeo publicitario corto de una película nueva.','Una historia corta que pretende ser graciosa.','Hablar muy bajo.','Quedar primero en un juego o competición.',
    'El momento en que nace un niño.','El examen necesario para obtener el permiso de conducir.','Tener éxito en un examen.','Desearle felicidad a alguien por un acontecimiento.','Dar las gracias a alguien por algo.','Un mensaje que cancela o rechaza algo.','Las dos personas que van a casarse.','Luces de colores en el cielo durante una fiesta.',
    'Nervioso y emocionado antes de algo importante.','Molesto porque algo causa problemas repetidamente.','Muy satisfecho con un logro propio o ajeno.','Infeliz y sin alegría.','Enfadarse o molestarse por algo.','Sentirse cómodo en un lugar o situación.','Discutir con enfado por opiniones diferentes.','Ayudar a que alguien vuelva a estar tranquilo.',
    'Un lugar donde se duerme durante un viaje.','Cuando un autobús o tren llega más tarde de lo previsto.','Bajarse de un transporte y tomar otro.','Un billete para autobús, tranvía o tren.','Maletas y bolsas que se llevan de viaje.','La hora a la que sale un autobús o tren.','Todos los vehículos que circulan por las calles.','El dinero utilizado en un país.',
    'Cuando un médico revisa el cuerpo o la salud.','Un documento médico para obtener un medicamento.','Una enfermedad leve con tos o mucosidad.','Descansar para que el cuerpo recupere fuerzas.','Una tienda donde se venden medicamentos.','Problemas de salud o dolores.','Acordar juntos una cita o un plan.','Decir que no se puede asistir a una cita.'
  ],
  tr: [
    'Bir kişinin çocukken ilk öğrendiği dil.','Bir dili güvenli ve az duraklayarak konuşmak.','Birinin söylediklerini dikkatle dinlemek.','Bir şeyin neden öyle olduğunu açıklamak.','Bir evi kullanmak için düzenli ödeme yapmak.','Bir evi veya binayı yeniden güzel hâle getirmek.','Büyük şehrin dışında, kırsal alanda.','Birinin korktuğunda hissettiği güçlü duygu.',
    'Üniversitede yapılan bir ders.','Birinin bir konu hakkında düşündüğü şey.','Aynı görüşte olduğunu söylemek.','Bir şeyi istemediğini veya kabul etmediğini söylemek.','Kendi isteğiyle ve zorunluluk olmadan.','Başka bir kişiye bağlı olmamak.','Bir işe başvurmak için kullanılan belgeler.','Uygulamalı çalışmalarla kazanılan bilgi.',
    'Bir cihazın resim ve metin gösteren kısmı.','Bilgisayarda yazı yazmaya yarayan cihaz.','Ses veya müzik çıkaran cihaz.','İnternetten bir dosyayı cihaza almak.','Cihazdaki bir dosyayı internete göndermek.','Bir mesajı başka bir kişiye göndermek.','Medyada yayımlanan metin, resim veya video.','Yalnızca bir kişi veya küçük grup için olan.',
    'Bir filmde gerçekleşen hikâye.','Bir hikâyedeki en önemli kişi.','İnsanları güldürmeyi amaçlayan eğlenceli film.','Bir suç ve çözümü hakkındaki hikâye.','Yeni bir film için kısa tanıtım videosu.','Komik olması amaçlanan kısa hikâye.','Çok sessiz konuşmak.','Bir oyun veya yarışmada birinci olmak.',
    'Bir çocuğun dünyaya geldiği an.','Ehliyet almak için gereken sınav.','Bir sınavda başarılı olmak.','Güzel bir olay için birini kutlamak.','Birine bir şey için teşekkür etmek.','Bir şeyin iptal veya reddedildiğini bildiren mesaj.','Evlenen iki kişi.','Bir kutlamada gökyüzündeki renkli ışıklar.',
    'Önemli bir olay öncesinde heyecanlı ve gergin.','Bir şey sürekli rahatsız ettiği için sinirli.','Kendi veya başkasının başarısından çok memnun.','Mutsuz ve neşesiz.','Bir şeye kızmak veya rahatsız olmak.','Bir yerde veya durumda kendini rahat hissetmek.','Farklı görüşler yüzünden öfkeli tartışmak.','Birinin yeniden sakinleşmesini sağlamak.',
    'Seyahat sırasında uyunan yer.','Otobüs veya trenin planlanandan geç gelmesi.','Bir ulaşım aracından inip diğerine binmek.','Otobüs, tramvay veya tren bileti.','Seyahatte taşınan bavul ve çantalar.','Otobüs veya trenin hareket ettiği zaman.','Yollarda hareket eden tüm araçlar.','Bir ülkede kullanılan para.',
    'Doktorun vücudu veya sağlığı kontrol etmesi.','İlaç almak için doktorun verdiği belge.','Öksürük veya burun akıntılı hafif hastalık.','Vücudun güç toplaması için dinlenmek.','İlaç satılan dükkân.','Sağlık sorunları veya ağrılar.','Bir randevu veya plan üzerinde anlaşmak.','Bir randevuya gelemeyeceğini söylemek.'
  ],
  zh: [
    '一个人小时候最先学会的语言。','流利、自信地说一种语言，很少停顿。','认真听别人说话。','解释某件事为什么如此。','定期付费使用住房。','把住宅或建筑重新修整漂亮。','在大城市以外的乡村地区。','人在害怕时产生的强烈感觉。',
    '大学里的一节课。','一个人对某个主题的看法。','表示自己有相同的意见。','表示不想要或不接受某件事。','出于自己的意愿，没有义务。','不依赖另一个人。','申请工作时使用的材料。','通过实践活动获得的知识。',
    '设备上显示图像和文字的部分。','在电脑上输入文字的设备。','播放声音或音乐的设备。','把网络文件保存到设备上。','把设备中的文件发送到网络。','把消息转发给另一个人。','媒体中发布的文字、图片或视频。','只供一个人或小范围群体使用。',
    '电影中发生的故事。','故事中最重要的人物。','让人发笑的有趣电影。','关于犯罪及其侦破的故事。','新电影的短宣传片。','为了逗人发笑的短故事。','非常小声地说话。','在比赛或竞赛中获得第一名。',
    '孩子出生的时刻。','取得驾驶执照所需的考试。','成功通过考试。','因喜事向某人表示祝贺。','因某件事向别人道谢。','通知取消或拒绝的消息。','即将结婚的两个人。','庆祝活动中天空里的彩色灯光。',
    '重要事情前既紧张又期待。','因为某事反复打扰而烦恼。','对自己或他人的成就非常满意。','不开心、没有喜悦。','对某件事生气或不满。','在某个地方或情境中感觉舒适。','因意见不同而生气地争吵。','让某人重新平静下来。',
    '旅行时住宿和睡觉的地方。','公交车或火车比计划晚到。','离开一种交通工具并换乘另一种。','公交车、有轨电车或火车的车票。','旅行时携带的行李箱和包。','公交车或火车出发的时间。','道路上行驶的所有车辆。','一个国家使用的货币。',
    '医生检查身体或健康状况。','医生开具的取药文件。','伴有咳嗽或流鼻涕的轻微疾病。','休息以便身体恢复力量。','出售药品的商店。','健康问题或疼痛。','共同确定一个约会或计划。','表示无法参加某个约会。'
  ],
  ja: [
    '子どもの頃に最初に覚える言語。','少ない間で自信を持って言語を話すこと。','相手の話を注意して聞くこと。','なぜそうなのかを説明すること。','住居を使うために定期的にお金を払うこと。','家や建物を再びきれいにすること。','大都市の外にある田舎。','怖いときに感じる強い感情。',
    '大学で行われる授業。','あるテーマについて人が考えていること。','同じ意見だと伝えること。','何かを望まない、または受け入れないと伝えること。','義務ではなく自分の意思で行うこと。','他の人に依存していないこと。','仕事に応募するための書類。','実際の活動を通して得た知識。',
    '画像や文字を表示する機器の部分。','コンピューターで文字を入力する機器。','音や音楽を出す機器。','インターネットから端末へファイルを保存すること。','端末からインターネットへファイルを送ること。','メッセージを別の人に転送すること。','メディアに掲載される文章、画像、動画。','一人または少人数だけを対象としたもの。',
    '映画の中で起こる物語。','物語の中で最も重要な人物。','人を笑わせる楽しい映画。','犯罪とその解決についての物語。','新しい映画を紹介する短い宣伝動画。','人を笑わせるための短い話。','とても小さな声で話すこと。','試合や競争で一位になること。',
    '子どもが生まれる瞬間。','運転免許を取得するための試験。','試験に合格すること。','うれしい出来事についてお祝いを伝えること。','何かについて相手に感謝すること。','中止や辞退を知らせるメッセージ。','結婚する二人。','お祝いのときに空に上がる色とりどりの光。',
    '大切な出来事の前で緊張し、わくわくしている状態。','何かに繰り返し邪魔されていらいらしている状態。','自分や他人の成果をとても誇らしく思うこと。','悲しく、喜びがない状態。','何かに腹を立てたり不満を感じたりすること。','場所や状況の中で心地よく感じること。','意見の違いから怒って言い争うこと。','相手が再び落ち着けるようにすること。',
    '旅行中に泊まって寝る場所。','バスや電車が予定より遅く到着すること。','一つの交通機関を降りて別のものに乗ること。','バス、路面電車、鉄道の切符。','旅行に持っていくスーツケースやかばん。','バスや電車が出発する時刻。','道路を走っているすべての車両。','ある国で使われているお金。',
    '医師が体や健康状態を確認すること。','薬を受け取るために医師が出す書類。','せきや鼻水を伴う軽い病気。','体力を回復するために休むこと。','薬を販売する店。','健康上の問題や痛み。','予約や計画を一緒に決めること。','予定に参加できないと伝えること。'
  ]
};

const expandedVocabularyIds = [
  'sw9','sw10','sw11','sw12','ba9','ba10','ba11','ba12','me9','me10','me11','me12','fk9','fk10','fk11','fk12',
  'er9','er10','er11','er12','ge9','ge10','ge11','ge12','rv9','rv10','rv11','rv12','ga9','ga10','ga11','ga12'
];

const expandedMeanings = {
  en: [
    'The money paid each month for a home.','The people and tasks belonging to one home.','To express a text in another language.','The area directly around a place.',
    'Practical preparation for a specific profession.','Money received regularly for work.','To officially end a work or rental contract.','To contact a company because you want a job.',
    'To remove a file or message from a device.','To stop a device from operating.','A link between devices, people, or places.','A short piece of information sent to someone.',
    'So interesting that you want to know what happens next.','Not interesting or varied.','To tell someone that something is good or suitable.','A ticket that allows entry to an event or place.',
    'The yearly date on which someone was born.','A request to attend an event.','To enjoy a special occasion together.','To take part in an activity or event.',
    'Reacting because something was unexpected.','Very angry and no longer calm.','Uneasy because something important will happen.','Sad because something was worse than expected.',
    'A list of departure and arrival times.','The journey back home or to the starting point.','To book a room or place in advance.','To arrive too late to catch or attend something.',
    'A fixed time agreed for a meeting or visit.','The hours when a doctor receives patients.','Something used to treat illness or symptoms.','A body temperature clearly above normal.'
  ],
  es: [
    'El dinero que se paga cada mes por una vivienda.','Las personas y tareas de una vivienda.','Expresar un texto en otro idioma.','La zona situada directamente alrededor de un lugar.',
    'Preparación práctica para una profesión concreta.','Dinero que se recibe regularmente por el trabajo.','Finalizar oficialmente un contrato laboral o de alquiler.','Contactar con una empresa porque se desea un empleo.',
    'Eliminar un archivo o mensaje de un dispositivo.','Detener el funcionamiento de un aparato.','Un enlace entre dispositivos, personas o lugares.','Una información breve enviada a alguien.',
    'Tan interesante que se quiere saber qué ocurrirá.','Poco interesante y sin variedad.','Decirle a alguien que algo es bueno o adecuado.','Una entrada para acceder a un evento o lugar.',
    'La fecha anual en la que nació una persona.','Una petición para asistir a un evento.','Disfrutar juntos de una ocasión especial.','Formar parte de una actividad o evento.',
    'Reaccionar porque algo no era esperado.','Muy enfadado y sin calma.','Inquieto porque ocurrirá algo importante.','Triste porque algo fue peor de lo esperado.',
    'Una lista de horas de salida y llegada.','El viaje de regreso a casa o al punto inicial.','Reservar con antelación una habitación o plaza.','Llegar demasiado tarde para alcanzar algo.',
    'Una hora acordada para una reunión o visita.','El horario en el que un médico recibe pacientes.','Algo utilizado para tratar una enfermedad o síntomas.','Una temperatura corporal claramente superior a la normal.'
  ],
  tr: [
    'Bir konut için her ay ödenen para.','Bir eve ait kişiler ve görevler.','Bir metni başka bir dilde ifade etmek.','Bir yerin hemen çevresindeki bölge.',
    'Belirli bir meslek için uygulamalı hazırlık.','Çalışma karşılığında düzenli alınan para.','İş veya kira sözleşmesini resmen sona erdirmek.','İş istemek için bir şirkete başvurmak.',
    'Bir dosya veya mesajı cihazdan kaldırmak.','Bir cihazın çalışmasını durdurmak.','Cihazlar, kişiler veya yerler arasındaki bağlantı.','Birine gönderilen kısa bilgi.',
    'Devamını merak ettirecek kadar ilginç.','İlginç veya çeşitli olmayan.','Bir şeyin iyi ya da uygun olduğunu söylemek.','Bir etkinliğe veya yere giriş sağlayan bilet.',
    'Bir kişinin doğduğu günün her yıl dönümü.','Bir etkinliğe gelme isteğini bildiren mesaj.','Özel bir günü birlikte güzel geçirmek.','Bir etkinlik veya faaliyete katılmak.',
    'Beklenmeyen bir şeye tepki gösteren.','Çok kızgın ve sakin olmayan.','Önemli bir şey öncesinde huzursuz.','Bir şey beklenenden kötü olduğu için üzgün.',
    'Kalkış ve varış saatlerinin listesi.','Eve veya başlangıç noktasına dönüş yolculuğu.','Bir oda veya yeri önceden ayırtmak.','Geç kaldığı için bir şeye yetişememek.',
    'Görüşme veya ziyaret için belirlenmiş saat.','Doktorun hasta kabul ettiği saatler.','Hastalık veya belirtileri tedavi eden madde.','Normalden belirgin biçimde yüksek vücut sıcaklığı.'
  ],
  zh: [
    '每个月为住房支付的钱。','一个家庭中的人员和家务。','把文字用另一种语言表达。','一个地点周围的区域。',
    '针对特定职业的实践培训。','定期因工作获得的钱。','正式结束工作或租赁合同。','因为想得到工作而向公司申请。',
    '从设备中移除文件或消息。','让设备停止运行。','设备、人员或地点之间的连接。','发送给某人的简短信息。',
    '非常有趣，让人想知道接下来发生什么。','不有趣、缺少变化。','告诉别人某事很好或很合适。','进入活动或场所所需的票。',
    '一个人出生日期的每年纪念日。','邀请别人参加活动的信息。','共同度过一个特别的日子。','参加一项活动或事件。',
    '因为事情出乎意料而产生反应。','非常生气，无法保持平静。','因为重要事情即将发生而不安。','因为结果不如预期而难过。',
    '列有出发和到达时间的表格。','返回家中或出发地点的旅程。','提前预订房间或座位。','因为迟到而没有赶上某事。',
    '为会面或访问约定的固定时间。','医生接待患者的时间。','用于治疗疾病或症状的药物。','明显高于正常值的体温。'
  ],
  ja: [
    '住居のために毎月支払うお金。','一つの家庭に属する人と家事。','文章を別の言語で表すこと。','ある場所のすぐ周りの地域。',
    '特定の職業に就くための実践的な訓練。','仕事の対価として定期的に受け取るお金。','仕事や賃貸の契約を正式に終了すること。','仕事を希望して会社に応募すること。',
    '端末からファイルやメッセージを消すこと。','機器の動作を止めること。','機器、人、場所の間のつながり。','誰かに送る短い情報。',
    '続きが知りたくなるほど興味深いこと。','興味や変化がないこと。','何かが良い、または適していると伝えること。','イベントや場所に入るための券。',
    '人が生まれた日の毎年の記念日。','イベントへの参加をお願いする知らせ。','特別な機会を一緒に楽しむこと。','活動やイベントに加わること。',
    '予想外のことに反応している状態。','とても怒っていて落ち着いていない状態。','大切なことの前で落ち着かない状態。','期待より悪い結果で悲しい状態。',
    '出発と到着の時刻を示す一覧。','家や出発地点へ戻る移動。','部屋や席を前もって確保すること。','遅れて乗り物や予定に間に合わないこと。',
    '面会や訪問のために決めた時刻。','医師が患者を診察する時間。','病気や症状を治療するためのもの。','通常より明らかに高い体温。'
  ]
};

export function getVocabularyTranslation(itemId, language) {
  if (language === 'de' || !meanings[language]) return null;
  const index = vocabularyIds.indexOf(itemId);
  if (index >= 0) return { meaning: meanings[language][index] };
  const expandedIndex = expandedVocabularyIds.indexOf(itemId);
  if (expandedIndex < 0) return null;
  return { meaning: expandedMeanings[language][expandedIndex] };
}
