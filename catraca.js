// Script para verificar permissões de grupos na catraca iDBlock
// Assume que você executa isso em um ambiente com Axios (ex.: Node.js ou navegador com Axios importado)
// IP da catraca: 191.52.62.21
// Inclui login automático com credenciais padrão (admin/admin)
// Considera o fuso horário da catraca: America/Sao_Paulo (UTC-3)
// Fornece detalhes mais granular sobre por que regras estão ativas/inativas, incluindo time_spans específicos

// Importe Axios se necessário (em Node.js: const axios = require('axios'); ou via CDN no navegador)
import axios from 'axios'
const BASE_URL = 'http://191.52.62.21' // IP da catraca
const TIMEZONE_OFFSET_HOURS = -3 // UTC-3 para America/Sao_Paulo (sem DST)

// Função para fazer POST JSON
async function apiPost (endpoint, data, includeSession = false) {
  let url = BASE_URL + endpoint
  if (includeSession && session) {
    url += '?session=' + session
  }
  try {
    const response = await axios.post(url, data, {
      headers: { 'Content-Type': 'application/json' },
    })
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

// Função para login e obter sessão
async function login () {
  try {
    const response = await apiPost('login.fcgi', {
      login: 'admin',
      password: 'admin',
    })
    return response.session
  } catch (error) {
    console.error(error)
    throw error
  }
}

// Função para carregar objetos com filtros opcionais
async function loadObjects (objectType, fields = null, where = null) {
  const params = { object: objectType }
  if (fields) {
    params.fields = fields
  }
  if (where) {
    params.where = where
  }
  const response = await apiPost('load_objects.fcgi', params, true)
  return response[objectType] || []
}

// Função para converter segundos para HH:MM
function secondsToTime (seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`
}

// Função para obter nome do dia
const dayNames = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

// Função para verificar se o horário atual está dentro de um time_span e retornar detalhes
function checkTimeSpan (span, nowSeconds, dayOfWeek, isHol1, isHol2, isHol3) {
  if (nowSeconds < span.start || nowSeconds > span.end) {
    return {
      match: false,
      reason: `Horário atual ${secondsToTime(
        nowSeconds,
      )} não está entre ${secondsToTime(span.start)} e ${secondsToTime(
        span.end,
      )}`,
    }
  }
  const days = [
    span.sun,
    span.mon,
    span.tue,
    span.wed,
    span.thu,
    span.fri,
    span.sat,
  ]
  const reason = `Horário atual ${secondsToTime(
    nowSeconds,
  )} está entre ${secondsToTime(span.start)} e ${secondsToTime(span.end)}`
  if (days[dayOfWeek] === 1) {
    return {
      match: true,
      reason: `${reason} e o dia atual é ${dayNames[dayOfWeek]} (permitido)`,
    }
  }
  if (isHol1 && span.hol1 === 1) {
    return {
      match: true,
      reason: `${reason} e hoje é feriado do tipo 1 (permitido)`,
    }
  }
  if (isHol2 && span.hol2 === 1) {
    return {
      match: true,
      reason: `${reason} e hoje é feriado do tipo 2 (permitido)`,
    }
  }
  if (isHol3 && span.hol3 === 1) {
    return {
      match: true,
      reason: `${reason} e hoje é feriado do tipo 3 (permitido)`,
    }
  }
  return {
    match: false,
    reason: `Dia atual ${dayNames[dayOfWeek]} não é permitido neste intervalo (nem feriado correspondente)`,
  }
}

// Função para verificar se a data atual é feriado de um tipo
async function getHolidayTypes (nowUnix) {
  const holidays = await loadObjects('holidays')
  let isHol1 = false,
    isHol2 = false,
    isHol3 = false
  const holidayDetails = []

  const nowDate = new Date(nowUnix * 1000)
  const nowYear = nowDate.getFullYear()

  for (const hol of holidays) {
    const holStart = new Date(hol.start * 1000)
    const holEnd = new Date(hol.end * 1000)

    if (hol.repeats === 1) {
      holStart.setFullYear(nowYear)
      holEnd.setFullYear(nowYear)
    }

    if (
      nowUnix >= Math.floor(holStart.getTime() / 1000)
      && nowUnix <= Math.floor(holEnd.getTime() / 1000)
    ) {
      if (hol.hol1 === 1) {
        isHol1 = true
        holidayDetails.push(`Feriado "${hol.name}" (tipo 1)`)
      }
      if (hol.hol2 === 1) {
        isHol2 = true
        holidayDetails.push(`Feriado "${hol.name}" (tipo 2)`)
      }
      if (hol.hol3 === 1) {
        isHol3 = true
        holidayDetails.push(`Feriado "${hol.name}" (tipo 3)`)
      }
    }
  }
  return { isHol1, isHol2, isHol3, holidayDetails }
}

// Função principal para verificar permissões
async function checkGroupPermissions () {
  try {
    // Fazer login para obter sessão
    session = await login()

    // Pegar tempo atual em UTC e ajustar para fuso horário da catraca (UTC-3)
    const nowUtc = new Date()
    const offsetMs = TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000
    const nowLocal = new Date(nowUtc.getTime() + offsetMs)
    const nowUnix = Math.floor(nowLocal.getTime() / 1000)
    const nowSeconds
      = nowLocal.getHours() * 3600
        + nowLocal.getMinutes() * 60
        + nowLocal.getSeconds()
    const dayOfWeek = nowLocal.getDay() // 0=dom, 1=seg, ..., 6=sab

    // Carregar feriados
    const { isHol1, isHol2, isHol3, holidayDetails } = await getHolidayTypes(
      nowUnix,
    )
    if (holidayDetails.length > 0) {
      console.log(`Hoje é feriado: ${holidayDetails.join('; ')}`)
    }

    // Carregar todos os groups
    const groups = await loadObjects('groups')

    const permitted = []
    const notPermitted = []

    for (const group of groups) {
      const groupId = group.id
      const groupName = group.name

      // Carregar regras vinculadas ao grupo
      const groupRules = await loadObjects('group_access_rules', null, {
        group_access_rules: { group_id: groupId },
      })
      if (groupRules.length === 0) {
        notPermitted.push({
          name: groupName,
          reason: 'Sem regras de acesso vinculadas ao grupo',
        })
        continue
      }

      let hasPermission = false
      let hasBlock = false
      const reasons = []

      for (const gr of groupRules) {
        const ruleId = gr.access_rule_id

        // Carregar a regra
        const rules = await loadObjects('access_rules', null, {
          access_rules: { id: ruleId },
        })
        if (rules.length === 0) {
          continue
        }
        const rule = rules[0]
        const ruleType = rule.type === 0 ? 'bloqueio' : 'permissão'

        // Carregar time_zones da regra
        const ruleTimes = await loadObjects('access_rule_time_zones', null, {
          access_rule_time_zones: { access_rule_id: ruleId },
        })

        let ruleActive = false
        const activeDetails = []
        const inactiveDetails = []

        if (ruleTimes.length === 0) {
          ruleActive = true // Assume sempre ativa se sem time_zone
          activeDetails.push(
            'Nenhum horário definido para a regra (sempre válida)',
          )
        } else {
          for (const rt of ruleTimes) {
            const tzId = rt.time_zone_id

            // Carregar time_spans do time_zone
            const spans = await loadObjects('time_spans', null, {
              time_spans: { time_zone_id: tzId },
            })

            for (const span of spans) {
              const check = checkTimeSpan(
                span,
                nowSeconds,
                dayOfWeek,
                isHol1,
                isHol2,
                isHol3,
              )
              if (check.match) {
                ruleActive = true
                activeDetails.push(check.reason)
              } else {
                inactiveDetails.push(check.reason)
              }
            }
          }
        }

        const detailStr = ruleActive
          ? `ativa agora porque: ${activeDetails.join('; ')}`
          : `não ativa agora porque: ${
            inactiveDetails.join('; ') || 'nenhum intervalo corresponde'
          }`

        if (rule.type === 0) {
          // Bloqueio
          if (ruleActive) {
            hasBlock = true
            reasons.push(`Regra de ${ruleType} "${rule.name}" ${detailStr}`)
          } else {
            reasons.push(
              `Regra de ${ruleType} "${rule.name}" ignorada porque ${detailStr}`,
            )
          }
        } else if (rule.type === 1) {
          // Permissão
          if (ruleActive) {
            hasPermission = true
            reasons.push(`Regra de ${ruleType} "${rule.name}" ${detailStr}`)
          } else {
            reasons.push(
              `Regra de ${ruleType} "${rule.name}" ignorada porque ${detailStr}`,
            )
          }
        }
      }

      if (hasBlock) {
        notPermitted.push({
          name: groupName,
          reason: reasons.join('; ') || 'Bloqueado por regra ativa',
        })
      } else if (hasPermission) {
        permitted.push({
          name: groupName,
          reason: reasons.join('; ') || 'Permitido por regra ativa',
        })
      } else {
        notPermitted.push({
          name: groupName,
          reason: reasons.join('; ') || 'Sem permissão ativa agora',
        })
      }
    }

    console.log('Grupos com permissão agora:')
    for (const g of permitted) {
      console.log(`- ${g.name}: ${g.reason}`)
    }

    console.log('Grupos sem permissão agora:')
    for (const g of notPermitted) {
      console.log(`- ${g.name}: ${g.reason}`)
    }
  } catch (error) {
    console.error('Erro ao verificar permissões:', error)
  }
}

// Executar a função
let session // Variável global para sessão
checkGroupPermissions()
