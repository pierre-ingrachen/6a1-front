import { Round } from "game/models/game.model"

export interface OutcomeMessage {
  title: string
  subtitle: string
}

const MESSAGES: Record<Round, OutcomeMessage> = {
  GROUP_STAGE: { title: "Éliminé en poules", subtitle: "Ça n'arrive jamais ici, mais bravo pour la curiosité." },
  ROUND_OF_16: { title: "Sorti en huitièmes", subtitle: "Le tirage était costaud. Une autre draft ?" },
  QUARTER_FINAL: { title: "Sorti en quarts", subtitle: "Plus que deux victoires pour toucher la gloire." },
  SEMI_FINAL: { title: "Sorti en demies", subtitle: "À un match de la finale. Tellement proche !" },
  FINAL: { title: "Finaliste malheureux", subtitle: "La coupe était là… Retente ta chance !" },
  WINNER: { title: "Champion d'Europe !", subtitle: "Une équipe de légende. Peux-tu le refaire ?" },
}

export const outcomeMessage = (round: Round): OutcomeMessage => MESSAGES[round]
