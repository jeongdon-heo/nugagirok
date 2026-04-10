export const CATEGORIES = [
  { id: "self", label: "자기관리", icon: "\u{1FA9E}", color: "#3B82F6" },
  { id: "community", label: "공동체역량", icon: "\u{1F91D}", color: "#10B981" },
  { id: "learning", label: "학습태도", icon: "\u{1F4DA}", color: "#F59E0B" },
  { id: "friendship", label: "교우관계", icon: "\u{1F4AC}", color: "#EC4899" },
  { id: "activity", label: "자치\xB7동아리", icon: "\u{1F3AF}", color: "#8B5CF6" },
  { id: "special", label: "특기사항", icon: "\u2B50", color: "#EF4444" },
];

export const NEGATIVE_KEYWORDS = [
  "못", "싫", "안 ", "없", "나쁘", "짜증", "멍청", "바보",
  "게으", "느려", "이상해", "못생", "더러", "시끄",
];

export const SCAFFOLDS = {
  self: [
    "\u25CB\u25CB이(가) 스스로 ~하는 모습이 인상적이었습니다.",
    "\u25CB\u25CB이(가) 자기 물건을 ~하는 모습을 보았습니다.",
  ],
  community: [
    "\u25CB\u25CB이(가) 친구들과 함께 ~할 때 ~하는 모습이 좋았습니다.",
    "\u25CB\u25CB이(가) 교실 규칙을 ~하며 지키는 모습이 보였습니다.",
  ],
  learning: [
    "\u25CB\u25CB이(가) 수업 시간에 ~하는 모습이 인상적이었습니다.",
    "\u25CB\u25CB이(가) ~과목에서 적극적으로 ~하였습니다.",
  ],
  friendship: [
    "\u25CB\u25CB이(가) 친구에게 ~해주는 따뜻한 모습을 보았습니다.",
    "\u25CB\u25CB이(가) ~한 상황에서 친구를 도와주었습니다.",
  ],
  activity: [
    "\u25CB\u25CB이(가) ~활동에서 ~하는 역할을 잘 수행하였습니다.",
    "\u25CB\u25CB이(가) 동아리 시간에 ~하는 모습이 돋보였습니다.",
  ],
  special: [
    "\u25CB\u25CB이(가) ~분야에서 특별한 재능을 보여주었습니다.",
    "\u25CB\u25CB이(가) ~에 대한 관심과 열정이 돋보였습니다.",
  ],
};

export const MISSIONS_POOL = [
  { text: "모둠 활동에서 친구의 협력하는 모습을 관찰해보세요", cat: "community" },
  { text: "쉬는 시간에 친구에게 친절하게 대하는 모습을 찾아보세요", cat: "friendship" },
  { text: "수업 시간에 집중하며 열심히 참여하는 친구를 관찰해보세요", cat: "learning" },
  { text: "스스로 정리정돈을 잘하는 친구를 찾아보세요", cat: "self" },
  { text: "학급 자치 활동에서 책임감 있게 행동하는 친구를 관찰해보세요", cat: "activity" },
];

export const DEFAULT_STUDENTS = [
  { name: "김가을", num: 1 },  { name: "김나래", num: 2 },
  { name: "박다운", num: 3 },  { name: "이라희", num: 4 },
  { name: "정마루", num: 5 },  { name: "최바다", num: 6 },
  { name: "한사랑", num: 7 },  { name: "윤아진", num: 8 },
  { name: "송자영", num: 9 },  { name: "오차민", num: 10 },
  { name: "임카연", num: 11 }, { name: "강태양", num: 12 },
  { name: "조파랑", num: 13 }, { name: "서하늘", num: 14 },
  { name: "문가온", num: 15 }, { name: "배나은", num: 16 },
  { name: "신다올", num: 17 }, { name: "류라온", num: 18 },
  { name: "장마음", num: 19 }, { name: "허바름", num: 20 },
];

export const today = () => new Date().toISOString().split("T")[0];
