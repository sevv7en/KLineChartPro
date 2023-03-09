/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createSignal, createEffect, onMount, JSX, Show, onCleanup, startTransition } from 'solid-js'

import { ComponentType } from 'solid-element'

import {
  init, dispose, KLineData, Nullable, Chart, registerOverlay, OverlayMode,
  TooltipIconPosition, ActionType, PaneOptions, Indicator, DomPosition
} from 'klinecharts'

import overlays from './extension'
import { SelectDataSourceItem, Loading } from './component'

import {
  PeriodBar, DrawingBar, IndicatorModal, TimezoneModal,
  ScreenshotModal, IndicatorSettingModal, SymbolSearchModal
} from './widget'

import { translateTimezone } from './widget/timezone-modal/data'

import { NetworkState, LoadDataEventDetail, UpdateDataEventDetail, SymbolInfo, RequestParams, Period, TransformSymbol, TransformKLineData } from './types'

import { DEFAULT_REQUREST_KLINE_URL } from './contants'
// @ts-expect-error
import styles from './index.less'

export interface KLineChartProProps {
  class: string
  style?: JSX.CSSProperties
  watermark?: string
  theme: string
  locale: string
  defaultDrawingBarVisible: boolean
  networkState: NetworkState
  defaultSymbol?: SymbolInfo
  symbol?: SymbolInfo
  defaultPeriod: Period
  period?: Period
  periods: Period[]
  defaultTimezone: string
  timezone?: string
  defaultMainIndicators: string[]
  defaultSubIndicators: string[],
  defaultSymbolLogo: string
  transformSymbol?: TransformSymbol
  transformKLineData?: TransformKLineData
  requestSymbolParams?: RequestParams
  requestKLineDataParams?: RequestParams
}

overlays.forEach(o => { registerOverlay(o) })

const Logo = (
  <svg class="logo" viewBox="0 0 80 92">
    <path d="M17.3121,90.6225C17.4517,90.6436,17.5901,90.6541,17.7274,90.6541C19.0559,90.6541,20.2213,89.6944,20.4295,88.3532C20.6566,86.8762,19.6297,85.4953,18.1367,85.2705C12.4557,84.4139,8.6332,82.4828,6.77344,79.5289C4.57886,76.0413,5.81634,72.041,5.82344,72.0188C5.85893,71.9123,5.88732,71.8035,5.9098,71.6934C8.12389,60.6361,11.356,53.3215,14.8104,48.1192C18.2648,42.9169,21.9414,39.8269,25.0446,37.2188C26.5968,35.915,28.0614,34.6827,29.2456,33.3731C30.9225,31.5172,31.6197,29.527,31.6725,27.5336C35.6187,26.8278,40.9421,26.2679,47.2065,26.583C48.0984,31.9917,53.6073,36.1009,54.9203,37.0116C62.331,44.1074,67.7577,51.6455,71.0525,59.4213C71.4914,60.4582,72.5065,61.082,73.576,61.082C73.9388,61.082,74.2976,61.01,74.6313,60.8702C76.0249,60.2932,76.6815,58.7074,76.0971,57.3287C72.4887,48.8133,66.5865,40.6151,58.5547,32.9599C58.4423,32.8523,58.3157,32.7516,58.1868,32.665C57.0851,31.9259,54.232,29.5936,53.0642,27.1195C53.1331,27.1287,53.2022,27.138,53.2713,27.1474C54.0162,29.0245,55.8642,30.3535,58.026,30.3535C59.5009,30.3535,60.8298,29.7349,61.7619,28.7456C64.8144,29.7431,68.4378,31.7217,69.4046,35.5848C69.6826,36.6932,70.687,37.4351,71.792,37.4351C71.9884,37.4351,72.1871,37.4117,72.3859,37.3638C73.7062,37.0407,74.5106,35.7206,74.1841,34.4145C72.9993,29.682,69.5399,26.8822,66.0787,25.233C69.5063,23.5492,71.5221,21.2286,71.6702,21.054C72.5457,20.0253,72.412,18.4886,71.3721,17.6226C70.3322,16.7577,68.78,16.8888,67.9033,17.9175C67.87,17.9563,65.4948,20.6901,61.621,21.7153C60.6982,20.8102,59.4281,20.2511,58.026,20.2511C57.4767,20.2511,56.9477,20.3369,56.4519,20.4957C60.0845,17.7606,64.6729,14.2394,65.5797,13.2374C67.1035,11.5533,68.7444,9.07333,67.9103,6.83096C67.4406,5.56933,66.3321,4.73254,64.8675,4.53476C63.5567,4.35687,62.3511,4.77234,61.2899,5.13865C59.4858,5.76127,58.3843,6.06556,56.7564,5.08482C56.1318,4.70797,55.5284,4.32176,54.9369,3.94374L54.9364,3.9434C51.4796,1.73271,47.5602,-0.773825,41.9871,0.726471C40.5296,1.11853,39.6695,2.60604,40.0659,4.04789C40.4622,5.48975,41.9647,6.34058,43.4234,5.94853C46.497,5.12109,48.4668,6.25164,51.9662,8.48933C52.5992,8.89427,53.2439,9.30622,53.9124,9.70882C56.1034,11.0278,58.1028,11.2502,59.7803,11.0758C57.5491,12.857,53.6142,15.8508,49.9988,18.539C49.8498,18.6502,49.7137,18.7754,49.5907,18.9135C48.8054,19.7953,48.2004,20.7386,47.7817,21.7249C40.8791,21.3359,35.0392,21.9433,30.7016,22.7299C28.9691,18.45,25.3757,14.69,23.6876,12.9237L23.2771,12.4919C22.3803,11.5427,21.4493,9.09088,20.724,6.56646C22.9517,7.09896,24.4992,7.27569,26.6784,7.49454C28.182,7.64786,29.5236,6.56295,29.6762,5.07662C29.83,3.59029,28.7357,2.26195,27.2321,2.11098C24.2638,1.81255,22.7731,1.66274,17.8125,0.123747C16.8976,-0.159672,15.8995,0.0512175,15.1814,0.679657C14.4636,1.30796,14.1306,2.26212,14.3036,3.19471C14.6017,4.80159,16.2438,12.9776,19.2819,16.1902L19.7125,16.6431C21.7693,18.7949,24.087,21.4425,25.3073,23.9616C23.5312,24.4607,22.5042,24.8571,22.352,24.9172C21.0897,25.4146,20.4756,26.8272,20.9761,28.076C21.4777,29.3247,22.908,29.9368,24.1703,29.4429C24.1971,29.4326,24.7465,29.2231,25.7556,28.9202C25.6051,29.2154,25.4105,29.4984,25.1676,29.7672C24.2342,30.7995,22.9683,31.8633,21.5025,33.0957C15.0785,38.4945,5.37624,46.647,0.56829,70.5137C0.241766,71.6314,-1.1223,77.1437,2.07787,82.3084C4.80718,86.7136,9.93219,89.5095,17.3121,90.6225ZM31.9158,3.86173C31.9158,5.61208,33.3502,7.03101,35.1195,7.03101C36.8889,7.03101,38.3233,5.61208,38.3233,3.86173C38.3233,2.11139,36.8889,0.69245,35.1195,0.69245C33.3502,0.69245,31.9158,2.11139,31.9158,3.86173ZM76.4249,69.6758C74.6555,69.6758,73.2212,68.2569,73.2212,66.5065C73.2212,64.7562,74.6555,63.3372,76.4249,63.3372C78.1943,63.3372,79.6286,64.7562,79.6286,66.5065C79.6286,68.2569,78.1943,69.6758,76.4249,69.6758ZM33.3378,91.7858C34.2038,91.7987,35.0734,91.8045,35.9465,91.8045C51.0955,91.8046,67.0041,89.9999,69.4317,89.142C76.148,86.7686,80,81.5992,80,74.9575C80,73.463,78.7755,72.2517,77.2648,72.2517C75.754,72.2517,74.5295,73.463,74.5295,74.9575C74.5295,79.3603,72.1953,82.4184,67.6134,84.037C65.7512,84.6175,49.6344,86.6059,33.4183,86.3742C31.9158,86.3297,30.6653,87.5457,30.6428,89.0402C30.6203,90.5359,31.827,91.7636,33.3378,91.7858ZM22.0693,88.8307C22.0693,90.5811,23.5037,92,25.2731,92C27.0424,92,28.4768,90.5811,28.4768,88.8307C28.4768,87.0804,27.0424,85.6615,25.2731,85.6615C23.5037,85.6615,22.0693,87.0804,22.0693,88.8307Z" fill-rule="evenodd" fill-opacity="1"/>
    <rect x="23.445068359375" y="52.683013916015625" width="12.70588207244873" height="22.702716827392578" rx="2" fill-opacity="1"/>
    <path d="M29.562697410583496 47.24264647066593C29.562697410583496 47.11269711728047 29.66804217572163 47.007352352142334 29.797991529107094 47.007352352142334L29.797991529107094 47.007352352142334C29.927940882492557 47.007352352142334 30.03328564763069 47.11269711728047 30.03328564763069 47.24264647066593L30.03328564763069 52.68303155899048C30.03328564763069 52.68303155899048 30.03328564763069 52.68303155899048 30.03328564763069 52.68303155899048L29.562697410583496 52.68303155899048C29.562697410583496 52.68303155899048 29.562697410583496 52.68303155899048 29.562697410583496 52.68303155899048Z" fill-opacity="1"/>
    <path d="M29.562697410583496 75.38572645187378C29.562697410583496 75.38572645187378 29.562697410583496 75.38572645187378 29.562697410583496 75.38572645187378L30.03328564763069 75.38572645187378C30.03328564763069 75.38572645187378 30.03328564763069 75.38572645187378 30.03328564763069 75.38572645187378L30.03328564763069 80.82611154019833C30.03328564763069 80.95606089358378 29.927940882492557 81.06140565872192 29.797991529107094 81.06140565872192L29.797991529107094 81.06140565872192C29.66804217572163 81.06140565872192 29.562697410583496 80.95606089358378 29.562697410583496 80.82611154019833Z" fill-opacity="1"/>
    <rect x="42.73918533325195" y="44.73706293106079" width="12.70588207244873" height="22.702716827392578" rx="2" fill-opacity="1"/>
    <path d="M48.85681438446045 39.2966954857111C48.85681438446045 39.166746132325635 48.962159149598584 39.0614013671875 49.09210850298405 39.0614013671875L49.09210850298405 39.0614013671875C49.22205785636951 39.0614013671875 49.327402621507645 39.166746132325635 49.327402621507645 39.2966954857111L49.327402621507645 44.737080574035645C49.327402621507645 44.737080574035645 49.327402621507645 44.737080574035645 49.327402621507645 44.737080574035645L48.85681438446045 44.737080574035645C48.85681438446045 44.737080574035645 48.85681438446045 44.737080574035645 48.85681438446045 44.737080574035645Z" fill-opacity="1"/>
    <path d="M48.85681438446045 67.43977546691895C48.85681438446045 67.43977546691895 48.85681438446045 67.43977546691895 48.85681438446045 67.43977546691895L49.327402621507645 67.43977546691895C49.327402621507645 67.43977546691895 49.327402621507645 67.43977546691895 49.327402621507645 67.43977546691895L49.327402621507645 72.88016055524349C49.327402621507645 73.01010990862895 49.22205785636951 73.11545467376709 49.09210850298405 73.11545467376709L49.09210850298405 73.11545467376709C48.962159149598584 73.11545467376709 48.85681438446045 73.01010990862895 48.85681438446045 72.88016055524349Z" fill-opacity="1"/>
  </svg>
)

function createIndicator (widget: Nullable<Chart>, indicatorName: string, isStack?: boolean, paneOptions?: PaneOptions): Nullable<string> {
  if (indicatorName === 'VOL') {
    paneOptions = { gap: { bottom: 2 }, ...paneOptions }
  }
  return widget?.createIndicator({
    name: indicatorName,
    // @ts-expect-error
    createTooltipDataSource: ({ indicator, defaultStyles }) => {
      const icons = []
      if (indicator.visible) {
        icons.push(defaultStyles.tooltip.icons[1])
        icons.push(defaultStyles.tooltip.icons[2])
        icons.push(defaultStyles.tooltip.icons[3])
      } else {
        icons.push(defaultStyles.tooltip.icons[0])
        icons.push(defaultStyles.tooltip.icons[2])
        icons.push(defaultStyles.tooltip.icons[3])
      }
      return { icons }
    }
  }, isStack, paneOptions) ?? null
}

const KLineChartPro: ComponentType<KLineChartProProps> = (props, componentOptions) => {
  let widgetRef: HTMLDivElement | undefined = undefined
  let widget: Nullable<Chart> = null
  let loading = false

  const [loadingVisible, setLoadingVisible] = createSignal(false)
  const [currentSymbol, setCurrentSymbol] = createSignal(props.symbol ?? props.defaultSymbol)
  const [currentPeriod, setCurrentPeriod] = createSignal(props.period ?? props.defaultPeriod)
  const [indicatorModalVisible, setIndicatorModalVisible] = createSignal(false)
  const [mainIndicators, setMainIndicators] = createSignal([...(props.defaultMainIndicators!)])
  const [subIndicators, setSubIndicators] = createSignal({})

  const [timezoneModalVisible, setTimezoneModalVisible] = createSignal(false)
  const [currentTimezone, setCurrentTimezone] = createSignal<SelectDataSourceItem>({ key: props.timezone ?? props.defaultTimezone, text: translateTimezone(props.defaultTimezone ?? props.timezone ?? 'Asia/Shanghai', props.locale!) })

  const [settingModalVisible, setSettingModalVisible] = createSignal(false)

  const [screenshotUrl, setScreenshotUrl] = createSignal('')

  const [drawingBarVisible, setDrawingBarVisible] = createSignal(props.defaultDrawingBarVisible)

  const [symbolSearchModalVisible, setSymbolSearchModalVisible] = createSignal(false)

  const [indicatorSettingModalParams, setIndicatorSettingModalParams] = createSignal({
    visible: false, indicatorName: '', paneId: '', calcParams: [] as Array<any>
  })

  const documentResize = () => {
    widget?.resize()
  }

  const queryKLine = async (requestParms: RequestParams | undefined, symbol: SymbolInfo, period: Period, timestamp?: number) => {
    const params = requestParms ?? {}
    const useDefault = !params.url || !params.url.startsWith('http')
    let to = timestamp ?? new Date().getTime()
    let from = to
    const count = 500
    switch (period.timespan) {
      case 'minute': {
        to = to - (to % (60 * 1000)) 
        from = to - count * period.multiplier * 60 * 1000
        break
      }
      case 'hour': {
        to = to - (to % (60 * 60 * 1000))
        from = to - count * period.multiplier * 60 * 60 * 1000
        break
      }
      case 'day': {
        to = to - (to % (60 * 60 * 1000))
        from = to - count * period.multiplier * 24 * 60 * 60 * 1000
        break
      }
      case 'week': {
        const date = new Date(to)
        const week = date.getDay()
        const dif = week === 0 ? 6 : week - 1
        to = to - dif * 60 * 60 * 24
        const newDate = new Date(to)
        to = new Date(`${newDate.getFullYear()}-${newDate.getMonth() + 1}-${newDate.getDate()}`).getTime()
        from = count * period.multiplier * 7 * 24 * 60 * 60 * 1000
        break
      }
      case 'month': {
        const date = new Date(to)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        to = new Date(`${year}-${month}-01`).getTime()
        from = count * period.multiplier * 30 * 24 * 60 * 60 * 1000
        const fromDate = new Date(from)
        from = new Date(`${fromDate.getFullYear()}-${fromDate.getMonth() + 1}-01`).getTime()
        break
      }
      case 'year': {
        const date = new Date(to)
        const year = date.getFullYear()
        to = new Date(`${year}-01-01`).getTime()
        from = count * period.multiplier * 365 * 24 * 60 * 60 * 1000
        const fromDate = new Date(from)
        from = new Date(`${fromDate.getFullYear()}-01-01`).getTime()
        break
      }
    }

    let url
    let options
    if (useDefault) {
      url = DEFAULT_REQUREST_KLINE_URL
      options = { ...params.options }
    } else {
      url = params.url
      options = params.options ?? {}
    }
    url = url?.replace('{{ticker}}', symbol.ticker)
    .replace('{{multiplier}}', `${period.multiplier}`)
    .replace('{{timespan}}', `${period.timespan}`)
    .replace('{{from}}', `${from}`)
    .replace('{{to}}', `${to}`)
    const keyValues: string[] = []
    for (const key in options) {
      let str = ''
      const value = options[key]
      switch (value) {
        case '{{ticker}}': {
          str = `${key}=${symbol.ticker}`
          break
        }
        case '{{multiplier}}': {
          str = `${key}=${period.multiplier}`
          break
        }
        case '{{timespan}}': {
          str = `${key}=${period.timespan}`
          break
        }
        case '{{from}}': {
          str = `${key}=${from}`
          break
        }
        case '{{to}}': {
          str = `${key}=${to}`
          break
        }
        default: {
          str = `${key}=${value}`
        }
      }
      keyValues.push(str)
    }
    const response = await fetch(`${url}?${keyValues.join('&')}`)
    const result = await response.json()
    return await (result.result || result.results || [])
  }

  onMount(() => {
    window.addEventListener('resize', documentResize)
    widget = init(widgetRef!)

    if (widget) {
      const dom = widget.getDom('candle_pane', DomPosition.Main)
      if (dom) {
        let child = document.createElement('div')
        child.className = 'klinecharts-pro-watermark'
        if (props.watermark) {
          const str = props.watermark.replace(/(^\s*)|(\s*$)/g, '')
          child.innerHTML = str
        } else {
          child.appendChild(Logo as Node)
        }
        dom.appendChild(child)
      }
    }

    mainIndicators().forEach(indicator => {
      createIndicator(widget, indicator, true, { id: 'candle_pane' })
    })
    const subIndicatorMap = {}
    props.defaultSubIndicators!.forEach(indicator => {
      const paneId = createIndicator(widget, indicator, true)
      if (paneId) {
        // @ts-expect-error
        subIndicatorMap[indicator] = paneId
      }
    })
    setSubIndicators(subIndicatorMap)
    widget?.loadMore(timestamp => {
      loading = true
      componentOptions.element.dispatchEvent(
        new CustomEvent<LoadDataEventDetail>(
          'loadData',
          {
            detail: {
              symbol: currentSymbol()!,
              period: currentPeriod(),
              timestamp,
              successCallback: (dataList: KLineData[], more: boolean) => {
                widget?.applyMoreData(dataList, more)
                loading = false
              },
              errorCallback: () => {
                loading = false
              }
            },
          }
        )
      )
    })
    widget?.subscribeAction(ActionType.OnTooltipIconClick, (data) => {
      if (data.indicatorName) {
        switch (data.iconId) {
          case 'visible': {
            widget?.overrideIndicator({ name: data.indicatorName, visible: true }, data.paneId)
            break
          }
          case 'invisible': {
            widget?.overrideIndicator({ name: data.indicatorName, visible: false }, data.paneId)
            break
          }
          case 'setting': {
            const indicator = widget?.getIndicatorByPaneId(data.paneId, data.indicatorName) as Indicator
            setIndicatorSettingModalParams({
              visible: true, indicatorName: data.indicatorName, paneId: data.paneId, calcParams: indicator.calcParams
            })
            break
          }
          case 'close': {
            if (data.paneId === 'candle_pane') {
              const newMainIndicators = [...mainIndicators()]
              widget?.removeIndicator('candle_pane', data.indicatorName)
              newMainIndicators.splice(newMainIndicators.indexOf(data.indicatorName), 1)
              setMainIndicators(newMainIndicators)
            } else {
              const newIndicators = { ...subIndicators() }
              widget?.removeIndicator(data.paneId, data.indicatorName)
              // @ts-expect-error
              delete newIndicators[data.indicatorName]
              setSubIndicators(newIndicators)
            }
          }
        }
      }
    })
  })

  onCleanup(() => {
    window.removeEventListener('resize', documentResize)
    dispose(widgetRef!)
  })

  createEffect(() => {
    const symbol = currentSymbol()
    widget?.setPriceVolumePrecision(symbol?.pricePrecision ?? 2, symbol?.volumePrecision ?? 0)
  })

  createEffect(() => {
    const period = currentPeriod()
    const symbol = currentSymbol()
    if (props.networkState === 'ok' && !loading && symbol) {
      loading = true
      setLoadingVisible(true)
      const r = async () => {
        const params = props.requestKLineDataParams ?? {}
        const useDefault = !params.url || !params.url.startsWith('http')
        const transferformKLineData = useDefault ? {
          timestamp: 't',
          open: 'o',
          high: 'h',
          low: 'l',
          close: 'c',
          volume: 'v',
          turnover: 'vw'
        } : (props.transformKLineData ?? {
          timestamp: 'timestamp',
          open: 'open',
          high: 'high',
          low: 'low',
          close: 'close',
          volume: 'volume',
          turnover: 'turnover'
        })
        const result = await queryKLine(props.requestKLineDataParams, symbol, period)
        widget?.applyNewData(result.map((data: any) => ({
          timestamp: data[transferformKLineData.timestamp],
          open: data[transferformKLineData.open],
          high: data[transferformKLineData.high],
          low: data[transferformKLineData.low],
          close: data[transferformKLineData.close],
          volume: data[transferformKLineData.volume],
          turnover: data[transferformKLineData.turnover]
        })))
        loading = false
        setLoadingVisible(false)
      }
      r()
      
      // componentOptions.element.dispatchEvent(
      //   new CustomEvent<LoadDataEventDetail>(
      //     'loadData',
      //     {
      //       detail: {
      //         symbol,
      //         period,
      //         timestamp: null,
      //         successCallback: (dataList: KLineData[], more: boolean) => {
      //           widget?.applyNewData(dataList, more)
      //           componentOptions.element.dispatchEvent(
      //             new CustomEvent<UpdateDataEventDetail>(
      //               'updateData',
      //               {
      //                 detail: {
      //                   symbol,
      //                   period,
      //                   callback: (data: KLineData) => {
      //                     widget?.updateData(data)
      //                   }
      //                 }
      //               }
      //             )
      //           )
      //           loading = false
      //           setLoadingVisible(false)
      //         },
      //         errorCallback: () => {
      //           loading = false
      //           setLoadingVisible(false)
      //         }
      //       }
      //     }
      //   )
      // )
    }
  })

  createEffect(() => {
    widget?.setStyles(props.theme)
    const color = props.theme === 'dark' ? '#929AA5' : '#76808F'
    widget?.setStyles({
      indicator: {
        tooltip: {
          icons: [
            {
              id: 'visible',
              position: TooltipIconPosition.Middle,
              marginLeft: 8,
              marginTop: 7,
              marginRight: 0,
              marginBottom: 0,
              paddingLeft: 0,
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 0,
              icon: '\ue903',
              fontFamily: 'icomoon',
              size: 14,
              color: color,
              activeColor: color,
              backgroundColor: 'transparent',
              activeBackgroundColor: 'rgba(22, 119, 255, 0.15)'
            },
            {
              id: 'invisible',
              position: TooltipIconPosition.Middle,
              marginLeft: 8,
              marginTop: 7,
              marginRight: 0,
              marginBottom: 0,
              paddingLeft: 0,
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 0,
              icon: '\ue901',
              fontFamily: 'icomoon',
              size: 14,
              color: color,
              activeColor: color,
              backgroundColor: 'transparent',
              activeBackgroundColor: 'rgba(22, 119, 255, 0.15)'
            },
            {
              id: 'setting',
              position: TooltipIconPosition.Middle,
              marginLeft: 6,
              marginTop: 7,
              marginBottom: 0,
              marginRight: 0,
              paddingLeft: 0,
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 0,
              icon: '\ue902',
              fontFamily: 'icomoon',
              size: 14,
              color: color,
              activeColor: color,
              backgroundColor: 'transparent',
              activeBackgroundColor: 'rgba(22, 119, 255, 0.15)'
            },
            {
              id: 'close',
              position: TooltipIconPosition.Middle,
              marginLeft: 6,
              marginTop: 7,
              marginRight: 0,
              marginBottom: 0,
              paddingLeft: 0,
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 0,
              icon: '\ue900',
              fontFamily: 'icomoon',
              size: 14,
              color: color,
              activeColor: color,
              backgroundColor: 'transparent',
              activeBackgroundColor: 'rgba(22, 119, 255, 0.15)'
            }
          ]
        }
      }
    })
  })

  createEffect(() => {
    if (props.timezone) {
      setCurrentTimezone({
        key: props.timezone,
        text: translateTimezone(props.timezone, props.locale!)
      })
    }
  })

  createEffect(() => {
    widget?.setLocale(props.locale)
  })

  createEffect(() => {
    widget?.setTimezone(currentTimezone().key)
  })

  createEffect(()=> {
    if (props.symbol) {
      setCurrentSymbol(props.symbol)
    }
  })

  return (
    <div
      style={props.style}
      class={`klinecharts-pro ${props.class}`}
      data-theme={props.theme}>
      <i class="icon-close klinecharts-pro-load-icon"/>
      <style>{styles}</style>
      <Show when={symbolSearchModalVisible()}>
        <SymbolSearchModal
          locale={props.locale}
          transformSymbol={props.transformSymbol}
          defaultSymbolLogo={props.defaultSymbolLogo}
          requestParams={props.requestSymbolParams}
          onSymbolSelected={symbol => { setCurrentSymbol(symbol) }}
          onClose={() => { setSymbolSearchModalVisible(false) }}/>
      </Show>
      <Show when={indicatorModalVisible()}>
        <IndicatorModal
          locale={props.locale}
          mainIndicators={mainIndicators()}
          subIndicators={subIndicators()}
          onClose={() => { setIndicatorModalVisible(false) }}
          onMainIndicatorChange={data => {
            const newMainIndicators = [...mainIndicators()]
            if (data.added) {
              createIndicator(widget, data.name, true, { id: 'candle_pane' })
              newMainIndicators.push(data.name)
            } else {
              widget?.removeIndicator('candle_pane', data.name)
              newMainIndicators.splice(newMainIndicators.indexOf(data.name), 1)
            }
            setMainIndicators(newMainIndicators)
          }}
          onSubIndicatorChange={data => {
            const newSubIndicators = { ...subIndicators() }
            if (data.added) {
              const paneId = createIndicator(widget, data.name)
              if (paneId) {
                // @ts-expect-error
                newSubIndicators[data.name] = paneId
              }
            } else {
              if (data.paneId) {
                widget?.removeIndicator(data.paneId, data.name)
                // @ts-expect-error
                delete newSubIndicators[data.name]
              }
            }
            setSubIndicators(newSubIndicators)
          }}/>
      </Show>
      <Show when={timezoneModalVisible()}>
        <TimezoneModal
          locale={props.locale}
          timezone={currentTimezone()}
          onClose={() => { setTimezoneModalVisible(false) }}
          onConfirm={timezone => { setCurrentTimezone(timezone) }}
        />
      </Show>
      <Show when={screenshotUrl().length > 0}>
        <ScreenshotModal
          locale={props.locale}
          url={screenshotUrl()}
          onClose={() => { setScreenshotUrl('') }}
        />
      </Show>
      <Show when={indicatorSettingModalParams().visible}>
        <IndicatorSettingModal
          locale={props.locale}
          params={indicatorSettingModalParams()}
          onClose={() => { setIndicatorSettingModalParams({ visible: false, indicatorName: '', paneId: '', calcParams: [] }) }}
          onConfirm={(params)=> {
            const modalParams = indicatorSettingModalParams()
            widget?.overrideIndicator({ name: modalParams.indicatorName, calcParams: params }, modalParams.paneId)
          }}
        />
      </Show>
      <PeriodBar
        locale={props.locale}
        defaultSymbolLogo={props.defaultSymbolLogo}
        symbol={currentSymbol()}
        spread={drawingBarVisible()}
        period={currentPeriod()}
        periods={props.periods}
        onMenuClick={async () => {
          try {
            await startTransition(() => setDrawingBarVisible(!drawingBarVisible()))
            widget?.resize()
          } catch (e) {}    
        }}
        onSymbolClick={() => { setSymbolSearchModalVisible(!symbolSearchModalVisible()) }}
        onPeriodChange={setCurrentPeriod}
        onIndicatorClick={() => { setIndicatorModalVisible((visible => !visible)) }}
        onTimezoneClick={() => { setTimezoneModalVisible((visible => !visible)) }}
        onSettingClick={() => { setSettingModalVisible((visible => !visible)) }}
        onScreenshotClick={() => {
          if (widget) {
            const url = widget.getConvertPictureUrl(true, 'jpeg', props.theme === 'dark' ? '#151517' : '#ffffff')
            setScreenshotUrl(url)
          }
        }}
      />
      <div
        class="klinecharts-pro-content">
        <Show when={loadingVisible()}>
          <Loading/>
        </Show>
        <Show when={drawingBarVisible()}>
          <DrawingBar
            locale={props.locale}
            onDrawingItemClick={overlay => { widget?.createOverlay(overlay) }}
            onModeChange={mode => { widget?.overrideOverlay({ mode: mode as OverlayMode }) }}
            onLockChange={lock => { widget?.overrideOverlay({ lock }) }}
            onVisibleChange={visible => { widget?.overrideOverlay({ visible }) }}
            onRemoveClick={(groupId) => { widget?.removeOverlay({ groupId }) }}/>
        </Show>
        <div
          ref={widgetRef}
          class='klinecharts-pro-widget'
          data-drawing-bar-visible={drawingBarVisible()}/>
      </div>
    </div>
  )
}

export default KLineChartPro