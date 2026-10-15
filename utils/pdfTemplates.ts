import { AvaliacaoResult } from "@/database/repositories/AvaliacaoTestMeemRepository";

type PdfData = {
  avaliacao: AvaliacaoResult;
  unidadeNome: string;
  profissionalNome: string;
  dataAvaliacao: string;
};

export function gerarHtmlResultadoMeem(dados: PdfData): string {
  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #333; }
          h1 { text-align: center; color: #732cad; }
          .section { margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #ccc; }
          .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .bold { font-weight: bold; }
          .score { font-size: 18px; color: #1F2937; }
        </style>
      </head>
      <body>
        <h1>Resultado do Rastreio Cognitivo</h1>
        
        <div class="section">
          <h2>Dados Gerais</h2>
          <div class="row"><span class="bold">Paciente:</span> <span>${dados.avaliacao.paciente_nome}</span></div>
          <div class="row"><span class="bold">Instrumento:</span> <span>${dados.avaliacao.instrumento_nome}</span></div>
          <div class="row"><span class="bold">Data:</span> <span>${dados.dataAvaliacao}</span></div>
          <div class="row"><span class="bold">Unidade de Saúde:</span> <span>${dados.unidadeNome}</span></div>
          <div class="row"><span class="bold">Profissional Responsável:</span> <span>${dados.profissionalNome}</span></div>
        </div>

        <div class="section">
          <h2>Pontuação Detalhada</h2>
          <div class="row"><span class="bold">Orientação Espacial:</span> <span>${dados.avaliacao.score_orientacao_espacial} pt(s)</span></div>
          <div class="row"><span class="bold">Orientação Temporal:</span> <span>${dados.avaliacao.score_orientacao_temporal} pt(s)</span></div>
          <div class="row"><span class="bold">Memória Imediata:</span> <span>${dados.avaliacao.score_memoria_imediata} pt(s)</span></div>
          <div class="row"><span class="bold">Atenção e Cálculo:</span> <span>${dados.avaliacao.score_atencao} pt(s)</span></div>
          <div class="row"><span class="bold">Memória Recente:</span> <span>${dados.avaliacao.score_memoria_recente} pt(s)</span></div>
          <div class="row"><span class="bold">Linguagem:</span> <span>${dados.avaliacao.score_linguagem} pt(s)</span></div>
          <div class="row"><span class="bold">Visuoespacial:</span> <span>${dados.avaliacao.score_visuoespacial} pt(s)</span></div>
        </div>

        <div class="section">
          <h2>Resultado Final</h2>
          <div class="row score"><span class="bold">Score Total:</span> <span>${dados.avaliacao.score_total} / 30</span></div>
          <div class="row score"><span class="bold">Classificação:</span> <span>${dados.avaliacao.classificacao}</span></div>
        </div>
      </body>
    </html>
  `;
}
