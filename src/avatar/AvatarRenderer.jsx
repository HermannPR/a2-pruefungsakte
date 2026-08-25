import { animals } from './avatarCatalog.js';

export default function AvatarRenderer({ avatar, size = 'regular', label }) {
  const animal = animals.find(item => item.id === avatar?.selectedAnimalId) ?? animals[0];
  const equipped = avatar?.equipped ?? {};
  const colors = animal.colors;
  return <svg className={`learner-avatar ${size}`} viewBox="0 0 240 240" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : 'true'}>
    <defs><filter id={`avatar-shadow-${animal.id}`} x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="6" stdDeviation="4" floodOpacity=".18" /></filter></defs>
    {equipped.background === 'a2-laurel' && <g className="avatar-laurel"><circle cx="120" cy="116" r="91" fill="#f5edcf" stroke="#d6a72d" strokeWidth="4" /><text x="120" y="48" textAnchor="middle" fill="#19735b" fontSize="18" fontFamily="Georgia, serif" fontWeight="800">A2</text><g fill="none" stroke="#19735b" strokeWidth="5" strokeLinecap="round"><path d="M57 184C27 146 32 92 69 57M183 184c30-38 25-92-12-127" /></g><g fill="#4f9a65"><ellipse cx="47" cy="158" rx="7" ry="15" transform="rotate(-42 47 158)" /><ellipse cx="42" cy="132" rx="7" ry="15" transform="rotate(-66 42 132)" /><ellipse cx="47" cy="105" rx="7" ry="15" transform="rotate(-83 47 105)" /><ellipse cx="59" cy="80" rx="7" ry="15" transform="rotate(-126 59 80)" /><ellipse cx="193" cy="158" rx="7" ry="15" transform="rotate(42 193 158)" /><ellipse cx="198" cy="132" rx="7" ry="15" transform="rotate(66 198 132)" /><ellipse cx="193" cy="105" rx="7" ry="15" transform="rotate(83 193 105)" /><ellipse cx="181" cy="80" rx="7" ry="15" transform="rotate(126 181 80)" /></g><path d="M75 190h90l-12 25H87z" fill="#d6a72d" /><text x="120" y="207" textAnchor="middle" fill="#25302a" fontSize="10" fontFamily="monospace" fontWeight="900">BESTANDEN</text></g>}
    <g filter={`url(#avatar-shadow-${animal.id})`}>
      <ellipse cx="120" cy="205" rx="65" ry="14" fill="#171b1a" opacity=".13" />
      <AnimalShape id={animal.id} colors={colors} />
      {equipped.neck && <NeckAccessory id={equipped.neck} />}
      {equipped.held && <HeldAccessory id={equipped.held} />}
      {equipped.head && <HeadAccessory id={equipped.head} />}
      {equipped.face === 'round-glasses' && <g><g fill="#dff7f5" fillOpacity=".2" stroke="#272b2a" strokeWidth="5"><circle cx="91" cy="105" r="20" /><circle cx="149" cy="105" r="20" /><path d="M111 105h18M69 98l-13-5m115 5l13-5" fill="none" /></g><g fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".78"><path d="M78 98l9-8m-5 15l11-10m43 3l9-8m-5 15l11-10" /></g></g>}
    </g>
  </svg>;
}

function AnimalShape({ id, colors }) {
  const common = <><ellipse cx="120" cy="161" rx="62" ry="55" fill={colors.body} /><ellipse cx="120" cy="174" rx="36" ry="31" fill={colors.light} opacity=".72" /></>;
  if (id === 'owl') return <g>{common}<path d="M66 83l22-35 20 39m66-4l-22-35-20 39" fill={colors.body} /><circle cx="120" cy="103" r="62" fill={colors.body} /><circle cx="91" cy="103" r="29" fill={colors.light} /><circle cx="149" cy="103" r="29" fill={colors.light} /><circle cx="91" cy="105" r="10" fill="#252b29" /><circle cx="149" cy="105" r="10" fill="#252b29" /><path d="M111 123l9 15 9-15z" fill={colors.accent} /></g>;
  if (id === 'capybara') return <g><ellipse cx="120" cy="170" rx="64" ry="48" fill={colors.body} /><ellipse cx="82" cy="67" rx="8" ry="9" fill={colors.accent} /><ellipse cx="158" cy="67" rx="8" ry="9" fill={colors.accent} /><path d="M73 80q10-21 37-23h20q27 2 37 23l8 48q-3 37-34 45h-42q-31-8-34-45z" fill={colors.body} /><path d="M78 113q7-18 29-20h26q22 2 29 20l7 27q-7 28-35 32h-28q-28-4-35-32z" fill={colors.light} opacity=".76" /><circle cx="84" cy="91" r="5.5" fill="#252b29" /><circle cx="156" cy="91" r="5.5" fill="#252b29" /><circle cx="82" cy="89" r="1.7" fill="#fff" opacity=".7" /><circle cx="154" cy="89" r="1.7" fill="#fff" opacity=".7" /><ellipse cx="107" cy="126" rx="5" ry="4" fill={colors.accent} /><ellipse cx="133" cy="126" rx="5" ry="4" fill={colors.accent} /><path d="M120 130v11m0 0q-10 6-18 0m18 0q10 6 18 0" fill="none" stroke={colors.accent} strokeWidth="3" strokeLinecap="round" /><path d="M111 146h18v9q-9 7-18 0z" fill="#f3e7ce" stroke={colors.accent} strokeWidth="2" /></g>;
  if (id === 'red-panda') return <g><path d="M169 169q54 4 38-48" fill="none" stroke={colors.body} strokeWidth="24" strokeLinecap="round" /><path d="M182 164l13-8m-6-16l14-7m-12-15l14-4" stroke={colors.light} strokeWidth="9" />{common}<circle cx="78" cy="72" r="25" fill={colors.body} /><circle cx="162" cy="72" r="25" fill={colors.body} /><circle cx="78" cy="72" r="13" fill={colors.light} /><circle cx="162" cy="72" r="13" fill={colors.light} /><circle cx="120" cy="111" r="62" fill={colors.body} /><ellipse cx="94" cy="108" rx="22" ry="29" fill={colors.accent} transform="rotate(24 94 108)" /><ellipse cx="146" cy="108" rx="22" ry="29" fill={colors.accent} transform="rotate(-24 146 108)" /><ellipse cx="120" cy="134" rx="35" ry="27" fill={colors.light} /><circle cx="94" cy="107" r="9" fill="#2c2522" /><circle cx="146" cy="107" r="9" fill="#2c2522" /><circle cx="91" cy="103" r="3" fill="#fff" opacity=".9" /><circle cx="143" cy="103" r="3" fill="#fff" opacity=".9" /><path d="M111 128q9-7 18 0-9 11-18 0" fill="#2c2522" /><path d="M120 139q-8 9-16 1m16-1q8 9 16 1" fill="none" stroke="#694034" strokeWidth="3" strokeLinecap="round" /></g>;
  if (id === 'cat' || id === 'orange-cat') return <CatShape id={id} colors={colors} />;
  if (id === 'fox') return <g>{common}<path d="M61 91l15-52 37 35m66 17l-15-52-37 35" fill={colors.body} /><circle cx="120" cy="111" r="61" fill={colors.body} /><path d="M73 99c14 4 29 13 47 35 18-22 33-31 47-35-5 37-20 62-47 62s-42-25-47-62z" fill={colors.light} /><circle cx="94" cy="108" r="7" fill="#202422" /><circle cx="146" cy="108" r="7" fill="#202422" /><path d="M111 130q9-7 18 0-9 13-18 0" fill={colors.accent} /></g>;
  if (id === 'eagle') return <g>{common}<path d="M61 86q18-50 59-41 41-9 59 41-22 7-34 28H95Q83 93 61 86z" fill={colors.light} /><circle cx="120" cy="111" r="56" fill={colors.light} /><circle cx="96" cy="107" r="7" fill="#202422" /><circle cx="144" cy="107" r="7" fill="#202422" /><path d="M103 124h34l-17 24z" fill={colors.accent} /></g>;
  return <g>{common}<circle cx="120" cy="108" r="62" fill={colors.body} /><ellipse cx="72" cy="77" rx="20" ry="24" fill={colors.body} /><ellipse cx="168" cy="77" rx="20" ry="24" fill={colors.body} /><ellipse cx="120" cy="125" rx="42" ry="31" fill={colors.light} /><circle cx="95" cy="104" r="6" fill="#202422" /><circle cx="145" cy="104" r="6" fill="#202422" /><ellipse cx="120" cy="122" rx="11" ry="8" fill={colors.accent} /></g>;
}

function CatShape({ id, colors }) {
  const guppy = id === 'cat';
  return <g>
    <ellipse cx="120" cy="164" rx="62" ry="55" fill={colors.body} />
    <ellipse cx="120" cy="177" rx="35" ry="30" fill={colors.light} opacity=".78" />
    <path d="M61 91l15-52 37 35m66 17l-15-52-37 35" fill={colors.body} />
    <circle cx="120" cy="111" r="61" fill={colors.body} />
    <path d="M167 176q37 0 28-42" fill="none" stroke={colors.body} strokeWidth="13" strokeLinecap="round" />
    {guppy ? <g>
      <path d="M120 70c-7 15-9 27-11 39-19 4-31 16-38 31 12 19 29 29 49 29s37-10 49-29c-7-15-19-27-38-31-2-12-4-24-11-39z" fill={colors.light} />
      <ellipse cx="94" cy="105" rx="16" ry="18" fill="#aaa64f" stroke="#171b1a" strokeWidth="3" />
      <ellipse cx="146" cy="105" rx="16" ry="18" fill="#aaa64f" stroke="#171b1a" strokeWidth="3" />
      <ellipse cx="94" cy="105" rx="3.4" ry="12" fill="#171b1a" /><ellipse cx="146" cy="105" rx="3.4" ry="12" fill="#171b1a" />
      <circle cx="89" cy="99" r="3.2" fill="#fff" opacity=".9" /><circle cx="141" cy="99" r="3.2" fill="#fff" opacity=".9" />
      <path d="M82 82q9-5 18-1m40 0q9-4 18 1" fill="none" stroke="#fff8e9" strokeWidth="2" strokeLinecap="round" />
      <path d="M113 128q7-6 14 0-7 10-14 0" fill={colors.accent} stroke="#332c2c" strokeWidth="1.5" />
      <path d="M120 126v10" stroke="#332c2c" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="114" cy="139" rx="7" ry="5" fill="#242827" transform="rotate(-12 114 139)" />
      <g fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M102 134L65 124m38 18l-38 4m73-12l37-10m-38 18l38 4" /><path d="M120 137c-5 8-13 8-17 1m17-1c5 8 13 8 17 1" stroke="#343837" /></g>
    </g> : <g>
      <ellipse cx="120" cy="135" rx="42" ry="29" fill={colors.light} />
      <ellipse cx="94" cy="105" rx="14" ry="16" fill="#b6bd65" stroke="#5c361f" strokeWidth="3" /><ellipse cx="146" cy="105" rx="14" ry="16" fill="#b6bd65" stroke="#5c361f" strokeWidth="3" />
      <ellipse cx="94" cy="105" rx="3" ry="10" fill="#33261d" /><ellipse cx="146" cy="105" rx="3" ry="10" fill="#33261d" />
      <circle cx="90" cy="100" r="3" fill="#fff" opacity=".9" /><circle cx="142" cy="100" r="3" fill="#fff" opacity=".9" />
      <path d="M108 62l7 22m12-22l-7 23m-22-16l10 18m34-18l-10 18M76 117l20 7m68-7l-20 7" fill="none" stroke={colors.accent} strokeWidth="6" strokeLinecap="round" />
      <path d="M113 128q7-6 14 0-7 10-14 0" fill="#dc8580" />
      <g fill="none" stroke="#6b3e26" strokeWidth="3" strokeLinecap="round"><path d="M120 136c-5 8-13 8-17 1m17-1c5 8 13 8 17 1M102 136L67 126m36 18l-36 3m71-11l35-10m-36 18l36 3" /></g>
    </g>}
  </g>;
}

function HeadAccessory({ id }) {
  if (id === 'headphones') return <g><path d="M68 101a52 52 0 01104 0" fill="none" stroke="#3266c5" strokeWidth="9" /><rect x="57" y="94" width="24" height="43" rx="11" fill="#272b2a" /><rect x="62" y="99" width="14" height="33" rx="7" fill="#3266c5" /><rect x="159" y="94" width="24" height="43" rx="11" fill="#272b2a" /><rect x="164" y="99" width="14" height="33" rx="7" fill="#3266c5" /></g>;
  return id === 'session-star' ? <path d="M120 23l9 19 21 3-15 15 4 21-19-10-19 10 4-21-15-15 21-3z" fill="#d6a72d" stroke="#272b2a" strokeWidth="3" /> : null;
}

function NeckAccessory({ id }) {
  if (id === 'reading-scarf') return <g fill="#bf392d"><path d="M75 151q45 23 90 0l-4 27q-41 18-82 0z" /><path d="M143 169l23 3-7 52-22-5z" /></g>;
  if (id === 'calendar-pin') return <g><path d="M105 157h30l-5 36h-20z" fill="#eee7d7" stroke="#272b2a" strokeWidth="3" /><path d="M105 167h30" stroke="#bf392d" strokeWidth="7" /></g>;
  return <g><path d="M110 154h20v24h-20z" fill="#d6a72d" /><circle cx="120" cy="188" r="16" fill={id === 'track-medal' ? '#3266c5' : '#d6a72d'} stroke="#272b2a" strokeWidth="3" /></g>;
}

function HeldAccessory({ id }) {
  if (id === 'microphone') return <g transform="rotate(-12 178 172)"><rect x="172" y="145" width="12" height="62" rx="6" fill="#272b2a" /><circle cx="178" cy="141" r="15" fill="#9b4e9f" /></g>;
  if (id === 'red-pencil') return <g transform="rotate(22 178 174)"><rect x="172" y="137" width="13" height="76" fill="#bf392d" /><path d="M172 137h13l-7-18z" fill="#d8b58b" /></g>;
  if (id === 'word-satchel') return <g><rect x="155" y="151" width="53" height="45" rx="5" fill="#9a623e" stroke="#272b2a" strokeWidth="3" /><path d="M163 153q18-30 36 0" fill="none" stroke="#272b2a" strokeWidth="5" /><text x="181" y="181" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">WÖRTER</text></g>;
  const golden = id === 'gold-dictionary';
  return <g transform="rotate(-8 175 174)"><rect x="148" y="137" width="59" height="70" rx="4" fill={golden ? '#d6a72d' : '#3266c5'} stroke="#272b2a" strokeWidth="4" /><path d="M158 137v70" stroke="#fff" strokeWidth="3" opacity=".7" /><text x="181" y="176" textAnchor="middle" fontSize="golden ? 10 : 13" fontWeight="900" fill="#fff">{golden ? 'WÖRTER' : 'GRAM.'}</text></g>;
}
