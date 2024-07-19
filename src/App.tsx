import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import { IData } from './App.data';
import * as XLSX from 'xlsx';

function App() {
  const [municipio, setMunicipio] = useState<string>("")
  const [page, setPage] = useState<number>(1)
  const [dados, setDados] = useState<IData[]>([])
  const [total, setTotal] = useState<number>(0)

  function criarArrayDeCidades(cidadesInput: string): string[] {
    const cidadesArray = cidadesInput.split(',').map(cidade => cidade.trim());
    return cidadesArray;
}

 

  const postBusca = async (pagina: number) => {
    const body = {
      query: {
          termo: [],
          atividade_principal: ["1033301", "1091101", "1091102", "1096100", "1099699", "1093701", "1094500", "4639701", "4721102", "5611201", "5611202", "5611203", "5620101", "5620103", "5612100", "5620104"],
          natureza_juridica: [],
          uf: [],
          municipio: criarArrayDeCidades(municipio),
          situacao_cadastral: "ATIVA",
          cep: [],
          ddd: []
      },
      range_query: {
          data_abertura: {
              lte: null,
              gte: "2024-01-01"
          },
          capital_social: {
              lte: null,
              gte: null
          }
      },
      extras: {
          somente_mei: false,
          excluir_mei: false,
          com_email: false,
          incluir_atividade_secundaria: false,
          com_contato_telefonico: false,
          somente_fixo: false,
          somente_celular: false,
          somente_matriz: false,
          somente_filial: false
      },
      page: pagina
  }

    await axios
      .post(`https://api.casadosdados.com.br/v2/public/cnpj/search`, body, {
      })
      .then((res) => {
        const data = res.data.data.cnpj;
        console.log(res.data)
        if (dados.length > 0) {
          setDados([...dados, ...data])
        }else {
          setTotal(res.data.data.lenght)
          setDados(data)
        }
        

      })
      .catch((err) => {
        console.error(err);
      });
  };

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // getUTCMonth() retorna de 0 a 11
    const year = date.getUTCFullYear();
  
    return `${day}/${month}/${year}`;
  }

  const s2ab = (s: string) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  };

  const handleExport = () => {
    // Cria uma nova planilha
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Converte o workbook para um arquivo binário
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

    // Cria um Blob a partir do arquivo binário
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });

    // Cria um link de download e clica nele programaticamente
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="App">

      <p className='title'>Site de buscas do Herberto</p>

      <div className='header'>

      <div className='container-input'>
        <input type="text" placeholder='Município' value={municipio} onChange={(e) => setMunicipio(e.target.value)} />
      </div>
      <div className='buttonSearch' onClick={() => postBusca(1)}><p>Buscar</p></div>
      </div>

      {dados.length > 0 &&<div className='body'>
       <div className='container-titles'>
        <p style={{width: 100}}>Número</p>
          <p style={{width: 160}}>CNPJ</p>
          <p style={{width: 600}}>Razão Social</p>
          <p>Data de Abertura</p>
        </div>
        {dados.map((item, lenght) => (
          <div className='container-dados'>
            <p style={{width: 100}}>{lenght}</p>
            <p style={{width: 160}}>{item.cnpj}</p>
            <p style={{width: 600}}>{item.razao_social}</p>
            <p>{formatDate(item.data_abertura)}</p>
          </div>
        ))}

        <div style={{display: "flex", justifyContent: "center", gap: 40, marginBottom: 40, marginTop: 20}}>
        <div onClick={() => postBusca(page + 1)} style={{cursor: "pointer"}}><p style={{textAlign: "center"}}>Carregar mais </p></div>
        <div onClick={() => handleExport()}  style={{cursor: "pointer"}}><p style={{textAlign: "center"}}>Exportar para xml </p></div>
        </div>
        
      </div>}

      
     
    </div>
  );
}

export default App;
