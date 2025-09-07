import { useState } from 'react'
import { Button } from '@/components/ui/button'
import pdfIcon from '@/assets/pdf.svg'
import { Sun, Moon } from 'lucide-react'
import type { RelatorioTecnico } from './types/relatorio'
import { FormularioRelatorio } from './components/FormularioRelatorio'
import { PreviewRelatorio } from './components/PreviewRelatorio'
import { gerarPDF } from './utils/pdfGenerator'
import { DadosEmpresa } from './components/DadosEmpresa'

function App() {
  const [relatorio, setRelatorio] = useState<RelatorioTecnico>({
    titulo: 'RELATÓRIO TÉCNICO DE SERVIÇO',
    data: new Date().toISOString().split('T')[0],
    contrato: {
      contrato: '',
      rq: '',
      fornecedor: '',
      valorInicial: 0,
      os: '',
      pedido: ''
    },
    escopo: {
      descricao: 'Abertura de alçapão.'
    },
    descricaoTecnica: {
      itens: [
        'Foi aberto um alçapão no forro de PVC conforme solicitação.',
        'Dimensões de cada alçapão: 60 cm x 60 cm.',
        'Localização dos alçapões: 01 (um) alçapão próximo ao evaporador, e o outro 01 (um) alçapão próximo ao condensador.'
      ]
    },
    tecnico: {
      nome: '',
      registro: '',
      especialidade: ''
    },
    equipamento: {
      nome: '',
      modelo: '',
      serial: '',
      marca: ''
    },
    problema: {
      descricao: '',
      sintomas: '',
      causa: ''
    },
    solucao: {
      procedimento: '',
      pecas: '',
      observacoes: ''
    },
    status: 'Concluído',
    valor: 0,
    assinatura: ''
  })

  const handleGerarPDF = async () => {
    try {
      await gerarPDF(relatorio)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    }
  }

  // Estado separado para snapshot do preview; só muda quando clicado o botão
  const [previewRelatorio, setPreviewRelatorio] = useState<RelatorioTecnico>(relatorio)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/95 dark:bg-card/90 backdrop-blur-sm p-8 shadow-lg border-b border-white/20 dark:border-border">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Gerador de Relatório Técnico
            </h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Claro"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-yellow-500 hover:bg-muted/60 data-[active=true]:text-yellow-500"
                data-active={document?.documentElement?.classList.contains('dark') ? false : true}
                onClick={() => {
                  document.documentElement.classList.remove('dark')
                  localStorage.setItem('theme', 'light')
                }}
              >
                <Sun className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Escuro"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-blue-400 hover:bg-muted/60 data-[active=true]:text-blue-400"
                data-active={document?.documentElement?.classList.contains('dark') ? true : false}
                onClick={() => {
                  document.documentElement.classList.add('dark')
                  localStorage.setItem('theme', 'dark')
                }}
              >
                <Moon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-muted-foreground font-normal">
            Configure seu relatório e visualize o preview em tempo real
          </p>
          <div className="mt-2 flex justify-center">
            <DadosEmpresa />
          </div>
        </div>
      </header>
      
      <div className="flex-1 grid grid-cols-[30%_70%] xl:grid-cols-[35%_65%] lg:grid-cols-1 gap-8 p-8 max-w-7xl mx-auto w-full">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 max-h-[80vh] overflow-y-auto lg:max-h-none">
          <FormularioRelatorio 
            relatorio={relatorio} 
            onChange={setRelatorio}
            onAtualizarPreview={() => setPreviewRelatorio(relatorio)}
          />
        </div>
        
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b-2 border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-foreground">Preview do Relatório</h2>
            <Button variant="outline" className="inline-flex items-center gap-2" onClick={handleGerarPDF}>
              <img src={pdfIcon} alt="PDF" className="w-5 h-5" />
              Gerar PDF
            </Button>
          </div>
          <PreviewRelatorio relatorio={previewRelatorio} />
        </div>
      </div>
    </div>
  )
}

export default App
