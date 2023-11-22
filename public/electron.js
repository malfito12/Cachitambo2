const { BrowserWindow, app, ipcMain } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const { v4: uuidv4 } = require('uuid');
const momet = require('moment')
// const {roundTo}= require('round-to');
// var round=require('lodash')

// import {roundTo, roundToUp, roundToDown} from 'round-to';
// const nativeImage=require('electron').nativeImage
// require('../src/database')
// const Product= require('../src/models/Products')


const mongoose = require('mongoose');
const {Schema}=require('mongoose')




//----------------------------NUEVA BASE DE DATOS----------------------------------
//----------------------------REGISTRO MATERIALES----------------------------------
const MATERIALSCHEMA = {
  nameMaterial: { type: String, index: true },
  codMaterial: {
    type: String,
    require: true,
    trim: true,
    unique: true,
  },
}
const MATERIAL = mongoose.model('material', MATERIALSCHEMA)
//------------------------------REGISTRO SUB-MATERIALES----------------------------
const SUBMATERIALSCHEMA = new Schema(
  {
    nameSubMaterial: { type: String, index: true },
    nameMaterial: { type: String, index: true },
    codMaterial: String,
    codSubMaterial: String,
    unidadMedida: String,
    image: String
  },
  { autoIndex: false },
)
SUBMATERIALSCHEMA.index({ nameMaterial: 'text', nameSubMaterial: 'text', codMaterial: 'text', codSubMaterial: 'text' })
const SUBMATERIAL = mongoose.model('submaterial', SUBMATERIALSCHEMA)
SUBMATERIAL.createIndexes()
//-------------------------REGISTRAR UNIDAD DE MEDIDA-----------------------------------
const UNIDADMEDIDASCHEMA = {
  nameUnidadMedida: String,
  simbolo: String
}
const UNIDADMEDIDA = mongoose.model('unidadmedida', UNIDADMEDIDASCHEMA)
//-------------------------------REGISTRO DE ENTRADAS Y SALIDAS----------------------------------
const ENTRADASSALIDASSCHEMA = {
  idAlmacen: String,
  typeRegister: String,
  numFactura: String,
  nameMaterial: String,
  codMaterial: String,
  nameSubMaterial: String,
  codSubMaterial: String,
  cantidadF: String,
  cantidadR: String,
  deDonde: String,
  unidadMedida: String,
  precio: String,
  precioUnitario: String,
  procedenciaDestino: String,
  registerDate: String,
  numeroIngreso: String,

  numVale: String,
  cantidadS: String,
  precioS: String,

}
const ENTRADASSALIDAS = mongoose.model('entradassalidas', ENTRADASSALIDASSCHEMA)
//-------------------------------REGISTRO DE KARDEX VALORADO--------------------------------
const KARDEXSCHEMA = {
  idAlmacen: String,
  typeRegister: String,
  registerDate: String,
  notaRemision: String,
  procedenciaDestino: String,
  cantidadE: String,
  precioE: String,
  cantidadS: String,
  precioS: String,
  cantidadTotal: String,
  precioTotal: String,
  precioUnitario: String,
  nameMaterial: String,
  nameSubMaterial: String,
  codMaterial: String,
  codSubMaterial: String,
  unidadMedida: String,
  numFactura: String,
  deDonde: String,
}
const KARDEX = mongoose.model('kardexs', KARDEXSCHEMA)

const CIERREMESSCHEMA = {
  mes: String,
  anio: String,
  contenido: Array,
  totalEntrada: String,
  totalSalida: String,
  total: String,
  registerDate: Date

}
const CIERREMES = mongoose.model('cierremeses', CIERREMESSCHEMA)

//-------------------------REGISTROS ALMACEN---------------------------------------
mongoose.connect('mongodb://localhost/cachitambodb', {
  // mongoose.connect('mongodb://localhost/electrondb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
  .then(db => {
    console.log("Base de Datos Conectada")
  })
  .catch(err => console.log(err));
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

//---------------REGISTRAR ENTRADAS Y SALIDAS--------------------

//---------------REGISTRAR INGRESO ALMACEN--------------------

//----------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------------------------

// const {createConnection,getConnection}=require('../src/database')
// import createConnection from '../src/database.js'

// const low = require('lowdb')
// // const FileAsync = require('lowdb/adapters/FileSync')
// const FileAsync = require('lowdb/adapters/FileAsync')

// let db;
// const createConnection = async() => {
//   const adapter = new FileAsync('data.json')
//   db = await low(adapter);
//   db.defaults({ productos: [] }).write()
// }
// createConnection()
let win

function createWindow() {
  win = new BrowserWindow({
    // width: 1200,
    // height: 800,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      plugins: true,
      // preload: path.join(__dirname, 'preload.js')
    }
  })
  win.removeMenu()
  win.maximize()
  win.show()

  // and load the index.html of the app.
  win.loadURL(
    isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../build/index.html")}`
  )
}


app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {

    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})



//-------------------------------OBTENER COD DE PRODUCT-------------------------------------
// ipcMain.handle('get-cod-product',async(e,args)=>{

// })



//-------------------------------GET CIERRE MES------------------------------------------
ipcMain.handle('get-cierre-mes', async (e, args) => {
  try {
    const result = await CIERREMES.find({})
    return JSON.stringify(result)
  } catch (error) {
    console.log(error)
  }
})
//-------------------------------POST CIERRE MES------------------------------------------
ipcMain.handle('post-cierre-mes', async (e, args) => {
  var result = args
  const deleteData = args.contenido[0].delete
  // console.log(result)
  try {
    const exist = await CIERREMES.find({ mes: result.mes, anio: result.anio })
    if (exist.length > 0) {
      return JSON.stringify({ message: 'Error, El mes ya tiene registros' })
    }
    for (var i = 0; i < deleteData.length; i++) {
      await KARDEX.deleteOne({ _id: deleteData[i]._id })
      console.log('entra')
    }
    result["registerDate"] = new Date()
    const prueba = new CIERREMES(result)
    await prueba.save()
    return JSON.stringify({ message: 'Cierre de Mes Registrado' })

  } catch (error) {
    console.log(error)
  }
})
//-------------------------------GET ULTIMO MES ------------------------------------------
ipcMain.handle('get-ultimo-mes', async (e, args) => {
  try {
    const result = await CIERREMES.find({}).sort({ _id: -1 }).limit(1)
    return JSON.stringify(result)
  } catch (error) {
    console.log(error)
  }
})

//----------------NUEVO CIERRE DE MES---------------------------------------------
ipcMain.handle('search-cierre-mes', async (e, args) => {
  console.log(args)
  const fechaInicio = args.fechaIni
  const fechaFin = args.fechaFin
  const changeIni = fechaInicio.split('-')
  var newFechaIni = changeIni[2] + '-' + changeIni[1] + '-' + changeIni[0]
  const changeFin = fechaFin.split('-')
  var newFechaFin = changeFin[2] + '-' + changeFin[1] + '-' + changeFin[0]

  try {
    const material = await MATERIAL.find({}).sort({ codMaterial: 1 })
    const data = []
    const deleteData = []
    for (var i = 0; i < material.length; i++) {
      var total = 0;
      var totalE = 0;
      var totalS = 0
      const array = []
      const subMatetial = await SUBMATERIAL.find({ codMaterial: material[i].codMaterial }).sort({ registerDate: 1 })
      for (var j = 0; j < subMatetial.length; j++) {
        //entradas
        var sumE = 0
        var cantidadE = 0
        //salidas
        var sumS = 0;
        var cantidadS = 0
        //total
        var precioUni = 0
        var sumTotal = 0;
        var cantidadTotal = 0;
        console.log(subMatetial[j].nameSubMaterial)
        while (newFechaIni <= newFechaFin) {
          const datos = await KARDEX.find({ $and: [{ codSubMaterial: subMatetial[j].codSubMaterial }, { registerDate: newFechaIni }] }).sort({ _id: -1 })
          var changeFecha = newFechaIni.split('-')
          var newFecha = parseInt(changeFecha[0]) + 1
          if (datos.length > 0) {
            precioUni = await KARDEX.find({ $and: [{ codSubMaterial: subMatetial[j].codSubMaterial }, { registerDate: newFechaIni }] }).sort({ _id: -1 }).limit(1)
            // console.log(precioUni)
            for (var k = 0; k < datos.length; k++) {
              if (datos[k].typeRegister === 'entrada') {
                sumTotal = sumTotal + parseFloat(datos[k].precioE)
                sumE = sumE + parseFloat(datos[k].precioE)
                cantidadTotal = cantidadTotal + parseFloat(datos[k].cantidadE)
                cantidadE = cantidadE + parseFloat(datos[k].cantidadE)
              } else {
                sumTotal = sumTotal - parseFloat(datos[k].precioS)
                sumS = sumS + parseFloat(datos[k].precioS)
                cantidadTotal = cantidadTotal - parseFloat(datos[k].cantidadS)
                cantidadS = cantidadS + parseFloat(datos[k].cantidadS)
              }
              deleteData.push(datos[k])
              console.log(deleteData.length)
            }
          }
          if (newFecha >= 10) {
            newFechaIni = newFecha.toString() + '-' + changeFecha[1] + '-' + changeFecha[2]
          } else {
            newFechaIni = '0' + newFecha.toString() + '-' + changeFecha[1] + '-' + changeFecha[2]
          }
        }

        array.push({
          codeSubMaterial: subMatetial[j].codSubMaterial,
          nameSubMaterial: subMatetial[j].nameSubMaterial,
          cantidadE: cantidadE,
          sumE: sumE,
          precioUniE: cantidadE === 0 ? 0 : precioUni[0].precioUnitario,
          cantidadS: cantidadS,
          sumS: sumS,
          precioUniS: cantidadS === 0 ? 0 : precioUni[0].precioUnitario,
          cantidad: cantidadTotal,
          precio: sumTotal.toFixed(4),
          precioUnit: precioUni.length > 0 ? precioUni[0].precioUnitario : 0
        })
        total = total + sumTotal
        totalE = totalE + sumE
        totalS = totalS + sumS
        newFechaIni = changeIni[2] + '-' + changeIni[1] + '-' + changeIni[0]
      }
      data.push({
        codeMaterial: material[i].codMaterial,
        nameMaterial: material[i].nameMaterial,
        contenido: array,
        totalE: totalE,
        totalS: totalS,
        total: total.toFixed(4),
        delete: deleteData,
      })

    }
    return JSON.stringify(data)
  } catch (error) {
    console.log(error)
  }
})

//--------------------------REGISTRO INGRESO DE MATERIALES AL ALMACEN------------------------------------------

//-------------------------- GET MATERIALES AL ALMACEN------------------------------------------

//-------------------------- GET MATERIALES AL ALMACEN DESCRIPTION------------------------------


//-------------------------GET DATA TAJETA DE EXISTENCIA SALDO ACTUAL----------------------------

//-------------------------GET DATA TAJETA DE EXISTENCIA----------------------------

//-------------------------GET DATA KARDEX VALORADO----------------------------




//----------------------------POST MATERIAL---------------------------------------
//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------
// ipcMain.on('post-material',async(e,args)=>{
//   // const result= args
//   console.log(args)
//   // e.reply('post-material', 'material registrado')
//   // e.reply('post-material', JSON.stringify(result))
//   // return JSON.stringify(result)
// })
ipcMain.handle('post-material', async (e, args) => {
  const result = args
  const cont = await MATERIAL.find().countDocuments()
  var data = {}
  if (cont < 9) {
    var aux = (cont + 1).toString()
    aux = '0' + aux + '-00X'
    data = {
      nameMaterial: result.nameMaterial,
      codMaterial: aux
    }
  } else if (cont >= 9) {
    var aux = (cont + 1).toString()
    aux = aux + '-00X'
    data = {
      nameMaterial: result.nameMaterial,
      codMaterial: aux
    }
  }
  const newMaterial = new MATERIAL(data)
  const materialSaved = await newMaterial.save()
  return JSON.stringify(materialSaved)
})

//----------------GET MATERIALES--------------------------
ipcMain.handle('get-material', async (e, args) => {
  const material = await MATERIAL.find().sort({ codMaterial: 1 })
  return JSON.stringify(material)
})
//-------------EDIT MATERIALES------------------------------
ipcMain.handle('edit-material', async (e, args) => {
  const result = args
  // console.log(typeof result.codMaterial)
  // console.log(typeof result.nameMaterial)

  try {
    const material = await MATERIAL.findById({ _id: result._id })
    await MATERIAL.findByIdAndUpdate({ _id: result._id }, result)
    await SUBMATERIAL.updateMany({ nameMaterial: material.nameMaterial, codMaterial: material.codMaterial }, { $set: { nameMaterial: result.nameMaterial, codMaterial: result.codMaterial } })
    await ENTRADASSALIDAS.updateMany({ codMaterial: material.codMaterial, nameMaterial: material.nameMaterial }, { $set: { codMaterial: result.codMaterial, nameMaterial: result.nameMaterial } })
    return JSON.stringify({ message: 'Material actualizado' })
  } catch (error) {
    console.log(error)
  }
})
//--------------DELETE MATERIALES---------------------------
ipcMain.handle("delete-material", async (e, args) => {
  const result = args
  try {
    const material = await MATERIAL.findById({ _id: result._id })
    await MATERIAL.findByIdAndDelete({ _id: result._id })
    await SUBMATERIAL.deleteMany({ codMaterial: material.codMaterial, nameMaterial: material.nameMaterial })
    await ENTRADASSALIDAS.deleteMany({ codMaterial: material.codMaterial, nameMaterial: material.nameMaterial })
    return JSON.stringify({ message: 'Material Eliminado' })
  } catch (error) {
    console.log(error)
  }
})
//----------------POST SUB-MATERIALES--------------------------
ipcMain.handle('post-subMaterial', async (e, args) => {
  const result = args
  // console.log(result)
  if (result.image == null) {
    var aux = result.codMaterial
    aux = aux.split("-")
    const cont = await SUBMATERIAL.find({ codMaterial: result.codMaterial }).countDocuments()
    var data = {}
    if (cont < 9) {
      var aux2 = (cont + 1).toString()
      aux2 = aux[0] + "-" + "00" + aux2
      data = {
        nameSubMaterial: result.nameSubMaterial,
        nameMaterial: result.nameMaterial,
        codMaterial: result.codMaterial,
        codSubMaterial: aux2,
        unidadMedida: result.unidadMedida,
      }
    } else if (cont >= 9 && cont < 99) {
      var aux2 = (cont + 1).toString()
      aux2 = aux[0] + "-" + "0" + aux2
      data = {
        nameSubMaterial: result.nameSubMaterial,
        nameMaterial: result.nameMaterial,
        codMaterial: result.codMaterial,
        codSubMaterial: aux2,
        unidadMedida: result.unidadMedida,
      }
    } else if (cont >= 99) {
      var aux2 = (cont + 1).toString()
      aux2 = aux[0] + "-" + aux2
      data = {
        nameSubMaterial: result.nameSubMaterial,
        nameMaterial: result.nameMaterial,
        codMaterial: result.codMaterial,
        codSubMaterial: aux2,
        unidadMedida: result.unidadMedida,
      }
    }
    const newSubMaterial = new SUBMATERIAL(data)
    const submaterialSaved = await newSubMaterial.save()

  } else {
    var aux = result.codMaterial
    aux = aux.split("-")
    const cont = await SUBMATERIAL.find({ codMaterial: result.codMaterial }).countDocuments()
    var data = {}
    if (cont < 9) {
      var aux2 = (cont + 1).toString()
      aux2 = aux[0] + "-" + "00" + aux2
      data = {
        nameSubMaterial: result.nameSubMaterial,
        nameMaterial: result.nameMaterial,
        codMaterial: result.codMaterial,
        codSubMaterial: aux2,
        unidadMedida: result.unidadMedida,
        image: result.image
      }
    } else if (cont >= 9 && cont <= 99) {
      var aux2 = (cont + 1).toString()
      aux2 = aux[0] + "-" + "0" + aux2
      data = {
        nameSubMaterial: result.nameSubMaterial,
        nameMaterial: result.nameMaterial,
        codMaterial: result.codMaterial,
        codSubMaterial: aux2,
        unidadMedida: result.unidadMedida,
        image: result.image
      }
    } else if (cont >= 100) {
      var aux2 = (cont + 1).toString()
      aux2 = aux[0] + "-" + aux2
      data = {
        nameSubMaterial: result.nameSubMaterial,
        nameMaterial: result.nameMaterial,
        codMaterial: result.codMaterial,
        codSubMaterial: aux2,
        unidadMedida: result.unidadMedida,
      }
    }
    const newSubMaterial = new SUBMATERIAL(data)
    const submaterialSaved = await newSubMaterial.save()
  }
  return JSON.stringify('sub-material registrado')

})

//---------------GET SUB-MATERIAL---------------------------------
ipcMain.handle('get-submaterial', async (e, args) => {
  const code = args
  try {
    const result = await SUBMATERIAL.find({ codMaterial: code }).sort({ codSubMaterial: 1 })
    return JSON.stringify(result)
  } catch (error) {
    console.log(error)
  }

})
//---------------GET SUB-MATERIAL DATA INICIAL Y FINAL---------------------------------
ipcMain.handle('get-data-sub-material', async (e, args) => {
  const params = args
  var array = []
  try {
    const result = await SUBMATERIAL.find({ codMaterial: params }).sort({ codSubMaterial: 1 })
    for (var i = 0; i < result.length; i++) {
      const primero = await KARDEX.find({ codSubMaterial: result[i].codSubMaterial }).sort({ $natural: 1 }).limit(1);
      // const ultimo = await KARDEX.find({ codSubMaterial: result[i].codSubMaterial }).sort({ $natural: -1 }).limit(1);
      const ultimo = await KARDEX.find({ codSubMaterial: result[i].codSubMaterial }).sort({ _id: -1 }).limit(1);
      // console.log(primero)
      // console.log(ultimo)
      if (primero.length > 0 && ultimo.length > 0) {
        array.push({
          _id: result[i]._id,
          codMaterial: result[i].codMaterial,
          // codSubMaterial: primero[0].codSubMaterial,
          codSubMaterial: result[i].codSubMaterial,
          // nameMaterial: primero[0].nameMaterial,
          nameMaterial: result[i].nameMaterial,
          // nameSubMaterial: primero[0].nameSubMaterial,
          nameSubMaterial: result[i].nameSubMaterial,
          // unidadMedida: primero[0].unidadMedida,
          unidadMedida: result[i].unidadMedida,
          saldoInicial: primero[0].cantidadE,
          saldoActual: ultimo[0].cantidadTotal,
          precioTotal: ultimo[0].precioTotal,
          precioUnitario: ultimo[0].precioUnitario,
          image: result[i].image
        })
      } else {
        array.push({
          _id: result[i]._id,
          codMaterial: result[i].codMaterial,
          nameMaterial: result[i].nameMaterial,
          codSubMaterial: result[i].codSubMaterial,
          nameSubMaterial: result[i].nameSubMaterial,
          unidadMedida: result[i].unidadMedida,
          saldoInicial: '0',
          saldoActual: '0',
          precioTotal: '0',
          precioUnitario: '0',
          image: result[i].image
        })
      }
    }
    // console.log(array)
    return JSON.stringify(array)
  } catch (error) {
    console.log(error)
  }
})
//------------EDIT SUB MATERIALES---------------------
ipcMain.handle("edit-submaterial", async (e, args) => {
  const result = args
  // console.log(result)
  try {
    const subMaterial = await SUBMATERIAL.findById({ _id: result._id })
    await SUBMATERIAL.findByIdAndUpdate({ _id: result._id }, result)
    await ENTRADASSALIDAS.updateMany({ codSubMaterial: subMaterial.codSubMaterial, nameSubMaterial: subMaterial.nameSubMaterial }, {
      $set: {
        codSubMaterial: result.codSubMaterial,
        nameSubMaterial: result.nameSubMaterial,
        unidadMedida: result.unidadMedida,
      }
    })
    await KARDEX.updateMany({ codSubMaterial: subMaterial.codSubMaterial, nameSubMaterial: subMaterial.nameSubMaterial }, {
      $set: {
        codSubMaterial: result.codSubMaterial,
        nameSubMaterial: result.nameSubMaterial,
        unidadMedida: result.unidadMedida,
      }
    })
    return JSON.stringify('Sub-Material actualizado')
  } catch (error) {
    console.log(error)
  }
})

//----------DELETE SUB-MATERIAL-----------------------------
ipcMain.handle("delete-submaterial", async (e, args) => {
  const result = args
  try {
    const subMaterial = await SUBMATERIAL.findById({ _id: result._id })
    await SUBMATERIAL.findByIdAndDelete({ _id: result._id })
    await ENTRADASSALIDAS.deleteMany({ codSubMaterial: subMaterial.codSubMaterial, nameSubMaterial: subMaterial.nameSubMaterial })
    await KARDEX.deleteMany({ codSubMaterial: subMaterial.codSubMaterial, nameSubMaterial: subMaterial.nameSubMaterial })
    return JSON.stringify('sub-material eliminado')
  } catch (error) {
    console.log(error)
  }
})

//---------------GET UNIDAD DE MEDIDA-----------------------------
ipcMain.handle('get-unidad-medida', async (e, args) => {
  try {
    const result = await UNIDADMEDIDA.find({})
    return JSON.stringify(result.rows)
  } catch (error) {
    console.log(error)
  }
})
//---------------POST UNIDAD DE MEDIDA-----------------------------
ipcMain.handle('post-unidadMedida', async (e, args) => {
  try {
    const unidadMedida = new UNIDADMEDIDA(args)
    const unidadMedidaSaved = await unidadMedida.save()
    return JSON.stringify('Unidad de Medida Registrada')
  } catch (error) {
    console.log(error)
  }
})

//---------------GET UNIDAD DE MEDIDA-----------------------------

ipcMain.handle('get-unidadMedida', async (e, args) => {
  try {
    const unidadMedida = await UNIDADMEDIDA.find()
    return JSON.stringify(unidadMedida)
  } catch (error) {
    console.log(error)
  }
})

//-------------POST ENTRADAS DE MATERIAL--------------------
ipcMain.handle('post-entradas', async (e, args) => {
  const result = args
  // console.log(result)
  // console.log(ultimo)

  const aux = result.length
  try {
    for (var i = 0; i < aux; i++) {
      const array = []
      var precioUnitarioReal = 0
      const ultimo = await KARDEX.find({ codSubMaterial: result[i].codSubMaterial }).sort({ $natural: -1 }).limit(1)
        .then(async resp => {
          // console.log(resp[0])
          if (resp.length > 0) {
            if (result[i].typeRegister === 'entrada') {
              // console.log('entra 1')
              const precioTotal = parseFloat(resp[0].precioTotal) + parseFloat(result[i].precio)
              var precioTotalReal = (Math.round(precioTotal * 100000) / 100000);
              const cantidadTotal = parseFloat(resp[0].cantidadTotal) + parseFloat(result[i].cantidadF)
              // error de redondeo 156.60/6   
              const precioUnitario = precioTotalReal / cantidadTotal
              precioUnitarioReal = (Math.round(precioUnitario * 100000) / 100000);
              array.push({
                idAlmacen: result[i].idAlmacen,
                typeRegister: result[i].typeRegister,
                nameMaterial: result[i].nameMaterial,
                nameSubMaterial: result[i].nameSubMaterial,
                codMaterial: result[i].codMaterial,
                codSubMaterial: result[i].codSubMaterial,
                registerDate: result[i].registerDate,
                notaRemision: result[i].numeroIngreso,
                procedenciaDestino: result[i].procedenciaDestino,
                cantidadE: result[i].cantidadF,
                precioE: result[i].precio,
                unidadMedida: result[i].unidadMedida,
                deDonde: result[i].deDonde,
                numFactura: result[i].numFactura,
                precioTotal: precioTotalReal,
                cantidadTotal: cantidadTotal,
                precioUnitario: precioUnitarioReal
                // precioUnitario: result[i].precioUnitario
              })
              // console.log(array)
              const kardex = new KARDEX(array[0])
              await kardex.save()
            } else {
              // console.log('entra 2')
              const precioTotal = parseFloat(resp[0].precioTotal) - parseFloat(result[i].precio)
              var precioTotalReal = (Math.round(precioTotal * 100000) / 100000);
              const cantidadTotal = parseFloat(resp[0].cantidadTotal) - parseFloat(result[i].cantidadF)
              const precioUnitario = parseFloat(resp[0].precioUnitario)
              precioUnitarioReal = (Math.round(precioUnitario * 100000) / 100000);
              array.push({
                idAlmacen: result[i].idAlmacen,
                typeRegister: result[i].typeRegister,
                nameMaterial: result[i].nameMaterial,
                nameSubMaterial: result[i].nameSubMaterial,
                codMaterial: result[i].codMaterial,
                codSubMaterial: result[i].codSubMaterial,
                registerDate: result[i].registerDate,
                notaRemision: result[i].numeroIngreso,
                procedenciaDestino: result[i].procedenciaDestino,
                cantidadE: result[i].cantidadF,
                precioE: result[i].precio,
                unidadMedida: result[i].unidadMedida,
                precioTotal: precioTotalReal,
                cantidadTotal: cantidadTotal,
                precioUnitario: precioUnitarioReal
              })
              const kardex = new KARDEX(array[0])
              await kardex.save()
            }
          } else {
            // console.log('entra 3')
            const precioUnitario = parseFloat(result[i].precio) / parseFloat(result[i].cantidadF)
            precioUnitarioReal = (Math.round(precioUnitario * 100000) / 100000);
            // console.log(roundedNum)
            // console.log(precioUnitario.toFixed(2))
            const precioTotal = parseFloat(result[i].precio)
            var precioTotalReal = (Math.round(precioTotal * 100000) / 100000);
            array.push({
              idAlmacen: result[i].idAlmacen,
              typeRegister: result[i].typeRegister,
              codMaterial: result[i].codMaterial,
              codSubMaterial: result[i].codSubMaterial,
              nameMaterial: result[i].nameMaterial,
              nameSubMaterial: result[i].nameSubMaterial,
              registerDate: result[i].registerDate,
              notaRemision: result[i].numeroIngreso,
              procedenciaDestino: result[i].procedenciaDestino,
              cantidadE: result[i].cantidadF,
              precioE: result[i].precio,
              unidadMedida: result[i].unidadMedida,
              deDonde: result[i].deDonde,
              numFactura: result[i].numFactura,
              precioTotal: precioTotalReal,
              cantidadTotal: result[i].cantidadF,
              // precioUnitario: precioUnitario.toFixed(2)
              precioUnitario: precioUnitarioReal
            })
            const kardex = new KARDEX(array[0])
            await kardex.save()
          }
        })
      var data2 = { ...result[i], precioUnitario: precioUnitarioReal }
      const entradaSalida = new ENTRADASSALIDAS(data2)
      entradaSalida.save()
    }
    // for (var i = 0; i < array.length; i++) {
    //   const kardex = new KARDEX(array[i])
    //   await kardex.save()
    // }
    return JSON.stringify('Registro exitoso')
  } catch (error) {
    console.log(error)
  }
})
//-------------POST SALIDA DE MATERIAL--------------------
ipcMain.handle(`post-salidas`, async (e, args) => {
  const result = args
  console.log(result)
  try {
    var newPrecioUnitario = 0
    const ultimo = await KARDEX.find({ codSubMaterial: result.codSubMaterial }).sort({ $natural: -1 }).limit(1)
      .then(async resp => {
        if (resp.length > 0) {

          // const precioTotal = parseFloat(resp[0].precioTotal) - parseFloat(result.precioS)
          var calculoPrecio = (parseFloat(resp[0].precioUnitario) * parseFloat(result.cantidadS)).toFixed(5)
          const precioTotal = parseFloat(resp[0].precioTotal) - calculoPrecio
          var precioTotalReal = (Math.round(precioTotal * 100000) / 100000);
          var cantidadTotal = parseFloat(resp[0].cantidadTotal) - parseFloat(result.cantidadS)
          // var precioUnitario = parseFloat(resp[0].precioUnitario)
          var precioUnitario = precioTotalReal / cantidadTotal
          var precioUnitarioReal = (Math.round(precioUnitario * 100000) / 100000);
          newPrecioUnitario = precioUnitarioReal
          //resta de prepcio total

          //--------------
          if (cantidadTotal === 0) {
            precioTotalReal = 0
            precioUnitarioReal = 0
            newPrecioUnitario = 0
          }
          const data = {
            idAlmacen: result.idAlmacen,
            typeRegister: result.typeRegister,
            codMaterial: result.codMaterial,
            codSubMaterial: result.codSubMaterial,
            nameMaterial: result.nameMaterial,
            nameSubMaterial: result.nameSubMaterial,
            registerDate: result.registerDate,
            notaRemision: result.numVale,
            procedenciaDestino: result.procedenciaDestino,
            cantidadS: result.cantidadS,
            // precioS: result.precioS,
            precioS: calculoPrecio,
            precioTotal: precioTotalReal,
            cantidadTotal: cantidadTotal,
            precioUnitario: precioUnitarioReal,
            unidadMedida: result.unidadMedida,
          }
          const kardex = new KARDEX(data)
          await kardex.save()
        }
      })
    const nuevo = { ...result, precioUnitario: newPrecioUnitario }
    const salidaMaterial = new ENTRADASSALIDAS(nuevo)
    await salidaMaterial.save()
    return JSON.stringify('salida de material registrada')
  } catch (error) {
    console.log(error)
  }
})


//-------------GET TARJETA EXISTENCIA-----------------------
ipcMain.handle(`get-tarjetaExistencia`, async (e, args) => {
  // const getData = await ENTRADASSALIDAS.find({ codSubMaterial: args }).sort({ _id: 1 })
  const getData = await KARDEX.find({ codSubMaterial: args }).sort({ _id: 1 })
  const cantidad = getData.length
  var array = []
  var sum = 0;
  var rest = 0;
  for (var i = 0; i < cantidad; i++) {
    if (getData[i].typeRegister === 'entrada') {
      // const n = parseFloat(getData[i].cantidadF)
      const n = parseFloat(getData[i].cantidadE)
      sum = sum + n
      var sumReal = (Math.round(sum * 100000) / 100000);
      array.push({
        typeRegister: getData[i].typeRegister,
        codMaterial: getData[i].codMaterial,
        nameMaterial: getData[i].nameMaterial,
        codSubMaterial: getData[i].codSubMaterial,
        nameSubMaterial: getData[i].nameSubMaterial,
        cantidadF: getData[i].cantidadE,
        // cantidadR: getData[i].cantidadR,
        precio: getData[i].precio,
        precioUnitario: getData[i].precioUnitario,
        procedenciaDestino: getData[i].procedenciaDestino,
        unidadMedida: getData[i].unidadMedida,
        registerDate: getData[i].registerDate,
        // numFactura: getData[i].numFactura,
        // numeroIngreso: getData[i].numeroIngreso,
        numeroIngreso: getData[i].notaRemision,
        deDonde: getData[i].deDonde,
        saldoExistencia: sumReal
      })
    } else if (getData[i].typeRegister === 'salida') {
      const m = parseFloat(getData[i].cantidadS)
      rest = sum - m;
      var restReal = (Math.round(rest * 100000) / 100000);
      array.push({
        typeRegister: getData[i].typeRegister,
        codMaterial: getData[i].codMaterial,
        nameMaterial: getData[i].nameMaterial,
        codSubMaterial: getData[i].codSubMaterial,
        nameSubMaterial: getData[i].nameSubMaterial,
        cantidadS: getData[i].cantidadS,
        // cantidadR:getData[i].cantidadR,
        precioS: getData[i].precioS,
        precioUnitario: getData[i].precioUnitario,
        procedenciaDestino: getData[i].procedenciaDestino,
        unidadMedida: getData[i].unidadMedida,
        registerDate: getData[i].registerDate,
        // numeroIngreso: getData[i].numeroIngreso,
        // numFactura:getData[i].numFactura,
        // deDonde:getData[i].deDonde,
        // numVale: getData[i].numVale,
        numVale: getData[i].notaRemision,
        saldoExistencia: restReal
      })
      sum = rest
    }
  }
  return JSON.stringify(array)
})

//---------------GET KARDEX DE EXISTENCIA VALORADO-------------------------
ipcMain.handle('get-kardexValorado', async (e, args) => {
  // const getData = await ENTRADASSALIDAS.find({ codSubMaterial: args }).sort({ registerDate: 1 })
  const getData = await ENTRADASSALIDAS.find({ codSubMaterial: args }).sort({ _id: 1 })
  // console.log(getData)
  const cantidad = getData.length
  var array = []
  var totalCantidad = 0;
  var totalValor = 0;
  var precioUni = 0
  // var   
  for (var i = 0; i < cantidad; i++) {
    // console.log(getData[i])
    if (i === 0) {
      const n = parseFloat(getData[i].cantidadF)
      totalCantidad = totalCantidad + n;
      const valor = parseFloat(getData[i].precio)
      totalValor = totalValor + valor;
      precioUni = parseFloat(getData[i].precioUnitario)
      // totalPrecioUnitario=totalPrecioUnitario+getData[i].precioUnitario
      array.push({
        numeroIngreso: getData[i].numeroIngreso,
        typeRegister: getData[i].typeRegister,
        registerDate: getData[i].registerDate,
        procedenciaDestino: getData[i].procedenciaDestino,
        cantidadF: getData[i].cantidadF,
        precio: getData[i].precio,
        totalCantidad: totalCantidad,
        totalValor: totalValor.toFixed(4),
        precioUnitario: precioUni.toFixed(4)
        // precioUnitario: totalPrecioUnitario.toFixed(2)
      })
    } else {
      let valor1 = parseFloat(getData[i - 1].precio)
      let valor2 = parseFloat(getData[i].precio)
      if (getData[i].typeRegister === 'entrada') {
        const n = parseFloat(getData[i].cantidadF)
        totalCantidad = totalCantidad + n;
        //-----------VALOR UNITARIO---------------------
        if (getData[i - 1].typeRegister === 'entrada') {
          precioUni = (valor1 + valor2) / totalCantidad
        } else {
          precioUni = (totalValor + valor2) / totalCantidad
        }
        //------------------------------------
        totalValor = totalValor + valor2;
        array.push({
          numeroIngreso: getData[i].numeroIngreso,
          typeRegister: getData[i].typeRegister,
          registerDate: getData[i].registerDate,
          procedenciaDestino: getData[i].procedenciaDestino,
          cantidadF: getData[i].cantidadF,
          precio: getData[i].precio,
          totalCantidad: totalCantidad,
          totalValor: totalValor.toFixed(4),
          // precioUnitario: getData[i].precioUnitario
          precioUnitario: precioUni.toFixed(4)
        })
      } else {
        var cantidadSalida = parseFloat(getData[i].cantidadS)
        var precioSalida = parseFloat(getData[i].precioS)
        //-----------------------------
        totalCantidad = totalCantidad - cantidadSalida;
        // precioUni = parseFloat(getData[i - 1].precioUnitario)
        // precioUni = parseFloat(getData[i].precioS)
        precioUni = parseFloat(getData[i].precioUnitario)
        var valorSalida = cantidadSalida * precioUni
        if (getData.length === 0) {
          totalValor = valor1 - valorSalida;
        } else {
          totalValor = totalValor - precioSalida
        }
        if (totalCantidad === 0) {
          precioUni = 0
        }
        //else {
        //   precioUni = parseFloat(totalValor.toFixed(2)) / parseFloat(totalCantidad)

        array.push({
          // numeroIngreso: getData[i].numeroIngreso,
          numeroIngreso: getData[i].numVale,
          typeRegister: getData[i].typeRegister,
          registerDate: getData[i].registerDate,
          procedenciaDestino: getData[i].procedenciaDestino,
          cantidadS: getData[i].cantidadS,
          // precioS: getData[i].precioS,
          // precioS: precioSalida.toFixed(2),
          // precioS: valorSalida.toFixed(2),
          precioS: getData[i].precioS,
          totalCantidad: totalCantidad,
          // totalValor: totalValor.toFixed(2),
          totalValor: totalValor.toFixed(4),
          // precioUnitario: getData[i].precioUnitario
          precioUnitario: precioUni.toFixed(4)
        })
      }
    }
  }
  return JSON.stringify(array)
})

//-------------GET SUB-MATERIAL TOTAL-----------------------
ipcMain.handle("get-subMaterial-total", async (e, args) => {
  const result = args
  const consulta = await SUBMATERIAL.find({ codMaterial: args }).sort({ codSubMaterial: 1 })
  const cantidad = consulta.length
  // console.log(consulta)
  var array = []
  for (var i = 0; i < cantidad; i++) {
    var cod = consulta[i].codSubMaterial
    // var subMaterial = await ENTRADASSALIDAS.find({ codSubMaterial: cod }).sort({ registerDate: 1 })
    var subMaterial = await KARDEX.find({ codSubMaterial: cod }).sort({ registerDate: 1 })
    // console.log(subMaterial)
    const cantidad2 = subMaterial.length
    var totalCantidad = 0;
    var totalValor = 0;
    var saldoInicial = 0;
    var precioUnitario = 0;
    var precioUni = 0;
    var unidadMedida = "";
    for (var j = 0; j < cantidad2; j++) {
      if (j === 0) {
        // saldoInicial = subMaterial[0].cantidadF
        // const n = parseFloat(subMaterial[j].cantidadF)
        // const valor = parseFloat(subMaterial[j].precio)
        saldoInicial = subMaterial[0].cantidadE
        const n = parseFloat(subMaterial[j].cantidadE)
        const valor = parseFloat(subMaterial[j].precioE)
        totalCantidad = totalCantidad + n;
        unidadMedida = subMaterial[0].unidadMedida
        totalValor = totalValor + valor;
        precioUni = parseFloat(subMaterial[j].precioUnitario)
        // array.push({
        //   unidadMedida: unidadMedida,
        //   saldoInicial: saldoInicial,
        //   saldoActual: totalCantidad.toFixed(2),
        //   precioTotal: totalValor,
        //   precioUnitario: precioUnitario,
        // })
      } else {
        if (subMaterial[j].typeRegister === 'entrada') {
          // saldoInicial = subMaterial[0].cantidadF
          // const n = parseFloat(subMaterial[j].cantidadF)
          saldoInicial = subMaterial[0].cantidadE
          const n = parseFloat(subMaterial[j].cantidadE)
          totalCantidad = totalCantidad + n;
          unidadMedida = subMaterial[0].unidadMedida
          if (subMaterial[j - 1].typeRegister === 'entrada') {
            // precioUni = (((subMaterial[j - 1].precioUnitario * parseInt(subMaterial[j - 1].cantidadF)) + (subMaterial[j].precioUnitario * parseInt(subMaterial[j].cantidadF))) / totalCantidad)
            precioUni = (((subMaterial[j - 1].precioUnitario * parseInt(subMaterial[j - 1].cantidadE)) + (subMaterial[j].precioUnitario * parseInt(subMaterial[j].cantidadE))) / totalCantidad)
          } else {
            // precioUni = (totalValor + (parseInt(subMaterial[j].cantidadF * subMaterial[j].precioUnitario))) / totalCantidad
            precioUni = (totalValor + (parseInt(subMaterial[j].cantidadE * subMaterial[j].precioUnitario))) / totalCantidad
          }
          //--------------------------------
          totalValor = totalCantidad * precioUni;
        } else {
          // saldoInicial = subMaterial[0].cantidadF
          // const n = parseFloat(subMaterial[j].cantidadS)
          saldoInicial = subMaterial[0].cantidadE
          const n = parseFloat(subMaterial[j].cantidadS)
          totalCantidad = totalCantidad - n;

          totalValor = totalCantidad * precioUni;
        }
      }

      //-------------------

      // if (subMaterial[j].typeRegister === 'entrada') {
      //   saldoInicial = subMaterial[0].cantidadF
      //   const n = parseFloat(subMaterial[j].cantidadF)
      //   const valor = parseFloat(subMaterial[j].precio)
      //   totalCantidad = totalCantidad + n;
      //   totalValor = totalValor + valor
      //   precioUnitario = subMaterial[j].precioUnitario
      //   unidadMedida = subMaterial[0].unidadMedida
      // } else {
      //   const m = parseFloat(subMaterial[j].cantidadS)
      //   const valor = parseFloat(subMaterial[j].precioS)
      //   totalCantidad = totalCantidad - m
      //   totalValor = totalValor - valor
      // }
    }
    totalValor = totalValor.toFixed(4)
    totalValor = new Intl.NumberFormat('es-BO').format(totalValor)
    array.push({
      unidadMedida: unidadMedida,
      saldoInicial: saldoInicial,
      saldoActual: totalCantidad,
      // precioTotal:totalValor.toFixed(2),
      precioTotal: totalValor,
      // precioUnitario: precioUnitario
      precioUnitario: precioUni.toFixed(4)
    })
  }
  // console.log()
  return JSON.stringify(array)
})
//--------------------GET ALAMACEN--------------------
ipcMain.handle("get-almacen-all", async (e, args) => {
  // const result = await ENTRADASSALIDAS.find({}).sort({ registerDate: 1 })
  // const result = await ENTRADASSALIDAS.find({}).sort({ _id: 1 })
  const result = await KARDEX.find({}).sort({ _id: 1 })
  const contador = result.length
  var array = []
  for (var i = 0; i < contador; i++) {
    if (result[i].typeRegister === 'entrada') {
      array.push({
        _id: result[i]._id,
        idAlmacen: result[i].idAlmacen,
        // cantidad: result[i].cantidadF,
        // cantidadR: result[i].cantidadR,
        cantidad: result[i].cantidadE,
        codMaterial: result[i].codMaterial,
        codSubMaterial: result[i].codSubMaterial,
        deDonde: result[i].deDonde,
        nameMaterial: result[i].nameMaterial,
        nameSubMaterial: result[i].nameSubMaterial,
        numFactura: result[i].numFactura,
        // numeroIngreso: result[i].numeroIngreso,
        numeroIngreso: result[i].notaRemision,
        // precio: result[i].precio,
        precio: result[i].precioE,
        precioUnitario: result[i].precioUnitario,
        procedenciaDestino: result[i].procedenciaDestino,
        registerDate: result[i].registerDate,
        typeRegister: result[i].typeRegister,
        unidadMedida: result[i].unidadMedida,
        precioTotal: result[i].precioTotal,
        cantidadTotal: result[i].cantidadTotal
      })
    } else {
      array.push({
        _id: result[i]._id,
        idAlmacen: result[i].idAlmacen,
        cantidad: result[i].cantidadS,
        codMaterial: result[i].codMaterial,
        codSubMaterial: result[i].codSubMaterial,
        nameMaterial: result[i].nameMaterial,
        nameSubMaterial: result[i].nameSubMaterial,
        precio: result[i].precioS,
        precioUnitario: result[i].precioUnitario,
        procedenciaDestino: result[i].procedenciaDestino,
        registerDate: result[i].registerDate,
        typeRegister: result[i].typeRegister,
        unidadMedida: result[i].unidadMedida,
        // numVale: result[i].numVale,
        numVale: result[i].notaRemision,
        precioTotal: result[i].precioTotal,
        cantidadTotal: result[i].cantidadTotal
      })
    }
  }
  return JSON.stringify(array)
})

//------------------DELETE ENTRADAS SALIDAS----------------------
ipcMain.handle('delete-entrada-salida', async (e, args) => {
  // const idAlmacen=args.idAlmacen
  try {
    await KARDEX.deleteOne({ idAlmacen: args })
    await ENTRADASSALIDAS.deleteOne({ idAlmacen: args })
    return JSON.stringify('Item eliminado')
  } catch (error) {
    console.log(error)
  }
})
//------------------GET INGRESO ALMACEN----------------------
ipcMain.handle("get-ingresoAlmacen", async (e, args) => {
  const result = await ENTRADASSALIDAS.find({ typeRegister: 'entrada' }).sort({ registerDate: 1 })
  return JSON.stringify(result)
})
//------------------GET SALIDA ALMACEN------------------------
ipcMain.handle('get-salidaAlmacen', async (e, args) => {
  const result = await ENTRADASSALIDAS.find({ typeRegister: 'salida' }).sort({ registerDate: 1 })
  return JSON.stringify(result)
})
//------------------GET NUMERO DE INGRESO-----------------------
ipcMain.handle("get-numeroIngreso", async (e, args) => {
  const result = await ENTRADASSALIDAS.find({ typeRegister: 'entrada' }).sort({ $natural: -1 }).limit(1)
  return JSON.stringify(result)
})

//------------------EDIT REGISTROS ENTRADAS SALIDAS-----------------------------
ipcMain.handle("edit-entradas-salidas", async (e, args) => {
  // console.log(args)
  const id = args._id
  const idAlmacen = args.idAlmacen
  const typeRegister = args.typeRegister
  const fecha = args.registerDate
  const change = fecha.split('-')
  var newFecha = change[2] + '-' + change[1] + '-' + change[0]
  var kardex = {
    cantidadE: args.cantidad,
    precioE: args.precio,
    precioUnitario: args.precioUnitario,
    procedenciaDestino: args.procedenciaDestino,
    registerDate: newFecha,
    unidadMedida: args.unidadMedida,
    precioTotal: args.precioTotal,
    cantidadTotal: args.cantidadTotal,
    notaRemision: args.numeroIngreso
  }
  var kardexSalida = {
    cantidadS: args.cantidad,
    precioS: args.precio,
    precioUnitario: args.precioUnitario,
    procedenciaDestino: args.procedenciaDestino,
    registerDate: newFecha,
    unidadMedida: args.unidadMedida,
    precioTotal: args.precioTotal,
    cantidadTotal: args.cantidadTotal,
    notaRemision: args.numVale
  }
  var kardexTotal = {
    cantidadTotal: 0,
    precioTotal: 0
  }

  // var data = await KARDEX.find({ $and: [{ codSubMaterial: args.codSubMaterial }, { registerDate: { $gte: newFecha } }] }).sort({ _id: 1 })
  var data = await KARDEX.find({ $and: [{ codSubMaterial: args.codSubMaterial }, { _id: { $gte: args._id } }] }).sort({ _id: 1 })

  if (data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      if (data[i].typeRegister === 'entrada') {
        if (i == 0) {
          // console.log('entra entrada 1')
          await KARDEX.updateOne({ idAlmacen: data[i].idAlmacen }, {
            // notaRemision: data[i].notaRemision,
            notaRemision: kardex.notaRemision,
            cantidadE: kardex.cantidadE,
            precioE: kardex.precioE,
            precioUnitario: kardex.precioUnitario,
            procedenciaDestino: kardex.procedenciaDestino,
            registerDate: kardex.registerDate,
            unidadMedida: kardex.unidadMedida,
            precioTotal: kardex.precioTotal,
            cantidadTotal: kardex.cantidadTotal
          }).then(resp => {
            kardexTotal = {
              precioTotal: kardex.precioTotal,
              cantidadTotal: kardex.cantidadTotal
            }
          })
        } else {
          // console.log('entra entrada 2')
          var cantidadTotal = parseFloat(kardexTotal.cantidadTotal) + parseFloat(data[i].cantidadE)
          var precioTotal = parseFloat(kardexTotal.precioTotal) + parseFloat(data[i].precioE)
          var precioTotalReal = (Math.round(precioTotal * 100000) / 100000)
          var precioUnitario = parseFloat(precioTotal) / parseFloat(cantidadTotal)
          var precioUnitarioReal = (Math.round(precioUnitario * 100000) / 100000)
          await KARDEX.updateOne({ idAlmacen: data[i].idAlmacen }, {
            notaRemision: data[i].notaRemision,
            cantidadE: data[i].cantidadE,
            precioE: data[i].precioE,
            precioUnitario: precioUnitarioReal,
            procedenciaDestino: data[i].procedenciaDestino,
            registerDate: data[i].registerDate,
            unidadMedida: data[i].unidadMedida,
            precioTotal: precioTotalReal,
            cantidadTotal: cantidadTotal
          }).then(resp => {
            kardexTotal = {
              precioTotal: precioTotalReal,
              cantidadTotal: cantidadTotal
            }
          })
        }
      } else if (data[i].typeRegister === 'salida') {
        if (i == 0) {
          // console.log('entra salida 1')
          await KARDEX.updateOne({ idAlmacen: data[i].idAlmacen }, {
            // notaRemision: data[i].notaRemision,
            notaRemision: kardexSalida.notaRemision,
            cantidadS: kardexSalida.cantidadS,
            precioS: kardexSalida.precioS,
            precioUnitario: kardexSalida.precioUnitario,
            procedenciaDestino: kardexSalida.procedenciaDestino,
            registerDate: kardexSalida.registerDate,
            unidadMedida: kardexSalida.unidadMedida,
            precioTotal: kardexSalida.precioTotal,
            cantidadTotal: kardexSalida.cantidadTotal
          }).then(resp => {
            kardexTotal = {
              precioTotal: kardexSalida.precioTotal,
              cantidadTotal: kardexSalida.cantidadTotal
            }
          })
        } else {
          // console.log('entra salida 2')
          var cantidadTotal = parseFloat(kardexTotal.cantidadTotal) - parseFloat(data[i].cantidadS)
          var precioTotal = parseFloat(kardexTotal.precioTotal) - parseFloat(data[i].precioS)
          var precioTotalReal = (Math.round(precioTotal * 100000) / 100000)
          var precioUnitario = parseFloat(precioTotal) / parseFloat(cantidadTotal)
          var precioUnitarioReal = (Math.round(precioUnitario * 100000) / 100000)
          if (cantidadTotal <= 0) {
            precioTotalReal = 0
            precioUnitarioReal = 0
          }
          await KARDEX.updateOne({ idAlmacen: data[i].idAlmacen }, {
            notaRemision: data[i].notaRemision,
            cantidadS: data[i].cantidadS,
            precioS: data[i].precioS,
            precioUnitario: precioUnitarioReal,
            procedenciaDestino: data[i].procedenciaDestino,
            registerDate: data[i].registerDate,
            unidadMedida: data[i].unidadMedida,
            precioTotal: precioTotalReal,
            cantidadTotal: cantidadTotal
          }).then(resp => {
            kardexTotal = {
              precioTotal: precioTotalReal,
              cantidadTotal: cantidadTotal
            }
          })
        }
      }
    }
    return JSON.stringify('registro editado')
  } else {
    console.log('no existen datos')
  }
})
//---------------GET SALDO TOTAL MATERIAL--------------------------
ipcMain.handle("get-saldoTotalMaterial", async (e, args) => {
  // const result = await MATERIAL.find().sort({ codMaterial: 1 })
  // const contador = result.length
  // var array = []
  // for (var i = 0; i < contador; i++) {
  //   var sum = 0;
  //   const codMaterial = result[i].codMaterial
  //   // const subMaterial = await ENTRADASSALIDAS.find({ codMaterial: codMaterial }).sort({ registerDate: 1 })
  //   const subMaterial = await KARDEX.find({ codMaterial: codMaterial }).sort({ registerDate: 1 })
  //   // console.log(subMaterial)
  //   const contSubMaterial = subMaterial.length
  //   for (var j = 0; j < contSubMaterial; j++) {
  //     if (subMaterial[j].typeRegister === 'entrada') {
  //       // var num = parseFloat(subMaterial[j].precio)
  //       var num = parseFloat(subMaterial[j].precioE)
  //       sum = sum + num
  //       // consoe.log(sum)
  //     } else {
  //       var num = parseFloat(subMaterial[j].precioS)
  //       sum = sum - num
  //       // console.log(sum)
  //     }
  //   }
  //   var otro = sum;
  //   sum = new Intl.NumberFormat('es-BO').format(sum)
  //   if (sum <= 0) {
  //     sum = 0
  //   }
  //   array.push({
  //     codMaterial: codMaterial,
  //     // nameSubMaterial:subMaterial[i].nameSubMaterial,
  //     saldoTotal: sum,
  //     otroSaldo: otro,
  //   })
  // }
  // console.log(array)


  const result = await MATERIAL.find().sort({ codMaterial: 1 })
  const contador = result.length

  var array = []
  for (var i = 0; i < contador; i++) {
    var sum = 0;
    const codMaterial = result[i].codMaterial
    const subMaterial = await SUBMATERIAL.find({ codMaterial: result[i].codMaterial }).sort({ registerDate: 1 })
    for (var j = 0; j < subMaterial.length; j++) {
      const ultimo = await KARDEX.find({ codSubMaterial: subMaterial[j].codSubMaterial }).sort({ _id: -1 }).limit(1);
      // console.log(ultimo)
      if (ultimo.length > 0) {
        sum = sum + parseFloat(ultimo[0].precioTotal)
      }
    }

    var otro = sum;
    sum = new Intl.NumberFormat('es-BO').format(sum)
    if (sum <= 0) {
      sum = 0
    }
    array.push({
      codMaterial: codMaterial,
      saldoTotal: sum,
      otroSaldo: otro,
    })
  }
  return JSON.stringify(array)
})

//---------------------------------------------------------
ipcMain.handle('get-um', async (e, args) => {
  try {
    const unidadM = await SUBMATERIAL.find({ codSubMaterial: args }, { unidadMedida: 1 })
    return JSON.stringify(unidadM)
  } catch (error) {
    console.log(error)
  }
})

//---------------GET SEPECIFIC MATERIAL-----------------
ipcMain.handle('get-specific-material', async (e, args) => {
  try {
    const specificMatetial = await MATERIAL.find({ codMaterial: args })
    return JSON.stringify(specificMatetial)
  } catch (error) {
    console.log(error)
  }
})
//---------------GET SEPECIFIC SUB MATERIAL-----------------
ipcMain.handle('get-specific-sub-material', async (e, args) => {
  try {
    const specificSubMatetial = await SUBMATERIAL.find({ codSubMaterial: args })
    return JSON.stringify(specificSubMatetial)
  } catch (error) {
    console.log(error)
  }
})

//-------------GET CANTIDAD SUB MATERIAL---------------
ipcMain.handle('get-cantidad-subMaterial', async (e, args) => {
  try {
    const cantidad = await ENTRADASSALIDAS.find({ codSubMaterial: args })
    return JSON.stringify(cantidad)
  } catch (error) {
    console.log(error)
  }
})


//----------------------BUSCADOR MATERIALES Y SUB MATERIALES-----------------------------
ipcMain.handle('buscador-mat-submat', async (e, args) => {
  const params = args
  try {
    if (params.typeTable === 'nameMaterials') {
      const result = await MATERIAL.find({ $text: { $search: `\`${params.text}\`` } }).sort({ codMaterial: 1 })
      return JSON.stringify(result)
      // console.log(result)
    } else if (params.typeTable === 'nameSubMaterials') {
      const array = []
      const result = await SUBMATERIAL.find({ $text: { $search: `\`${params.text}\`` } }).sort({ codSubMaterial: 1 })
      for (var i = 0; i < result.length; i++) {
        const ultimo = await KARDEX.find({ codSubMaterial: result[i].codSubMaterial }).sort({ $natural: -1 }).limit(1);
        if (ultimo.length > 0) {
          array.push({
            codMaterial: result[i].codMaterial,
            codSubMaterial: result[i].codSubMaterial,
            nameMaterial: result[i].nameMaterial,
            nameSubMaterial: result[i].nameSubMaterial,
            unidadMedida: result[i].unidadMedida,
            cantidadTotal: ultimo[0].cantidadTotal
          })
        } else {
          array.push({
            codMaterial: result[i].codMaterial,
            codSubMaterial: result[i].codSubMaterial,
            nameMaterial: result[i].nameMaterial,
            nameSubMaterial: result[i].nameSubMaterial,
            unidadMedida: result[i].unidadMedida,
            cantidadTotal: 0
          })
        }
        // console.log(ultimo[0])
      }
      return JSON.stringify(array)
      // console.log(result)
    }
  } catch (error) {
    console.log(error)
  }
})
//------------------------------------------------------
//------------------------------------------------------
//------------------------------------------------------
//------------------------------------------------------
//------------------------------------------------------
//------------------------------------------------------
//------------------------------------------------------
//------------------------------------------------------
//--------------PRUEBA-------------------
ipcMain.handle('prueba-1', async (e, args) => {
  try {
    const prueba = new PRUEBA(args)
    await prueba.save()
    return JSON.stringify('prueba regitrada')
  } catch (error) {
    console.log(error)
  }
})
ipcMain.handle('prueba-get-1', async () => {
  try {
    const result = await PRUEBA.find()
    return JSON.stringify(result)
  } catch (error) {
    console.log(error)
  }
})

//----------CAMBIAR FECHA-------------------
ipcMain.handle('cambiar-fechas', async (e, args) => {
  try {
    const result = await ENTRADASSALIDAS.find({})
    const cont = result.length
    for (var i = 0; i < cont; i++) {
      var fecha = result[i].registerDate
      var change = fecha.split('-')
      var newFecha = change[2] + '-' + change[1] + '-' + change[0]
      // await ENTRADASSALIDAS.findOneAndUpdate({ _id: id }, {
      await ENTRADASSALIDAS.findOneAndUpdate({ _id: result[i]._id }, { registerDate: newFecha })
    }
    return JSON.stringify('cambio completado')
  } catch (error) {
    console.log(error)
  }
})

ipcMain.handle('edit-fecha-prueba', async (e, args) => {
  // console.log(args)
  const fecha = args.registerDate
  const change = fecha.split('-')
  var newFecha = change[2] + '-' + change[1] + '-' + change[0]
  try {
    await PRUEBA.findOneAndUpdate({ _id: args._id }, {
      typeRegister: 'salida',
      cantidadF: args.cantidadF,
      precio: args.precio,
      precioUnitario: args.precioUnitario,
      procedenciaDestino: args.procedenciaDestino,
      unidadMedida: args.unidadMedida,
      registerDate: newFecha,
      numVale: args.numVale,
    })
    return JSON.stringify('actualizado')
  } catch (error) {
    console.log(error)
  }
})

//----------------REGISTER KARDEX VALORADO---------------
ipcMain.handle('register-kardex-valorado', async (e, args) => {
  const result = args

})

//--------------REGISTER MOVIMIENTOS----------------------------
ipcMain.handle('register-movimiento', async (e, args) => {
  try {
    // const data = await ENTRADASSALIDAS.find({})
    const materiales = await MATERIAL.find({})
    var array = []
    for (var a = 0; a < materiales.length; a++) {
      const subMaterial = await SUBMATERIAL.find({ codMaterial: materiales[a].codMaterial })
      if (subMaterial.length > 0) {
        for (var i = 0; i < subMaterial.length; i++) {
          const entradassalidas = await ENTRADASSALIDAS.find({ codSubMaterial: subMaterial[i].codSubMaterial })
          var cantidadTotal = 0
          var precioTotal = 0
          for (var b = 0; b < entradassalidas.length; b++) {
            // console.log(entradassalidas)
            if (b === 0) {
              cantidadTotal = cantidadTotal + parseFloat(entradassalidas[b].cantidadF)
              precioTotal = precioTotal + parseFloat(entradassalidas[b].precio)
              array.push({
                idAlmacen: entradassalidas[b].idAlmacen,
                typeRegister: entradassalidas[b].typeRegister,
                registerDate: entradassalidas[b].registerDate,
                notaRemision: entradassalidas[b].numeroIngreso,
                procedenciaDestino: entradassalidas[b].procedenciaDestino,
                cantidadE: entradassalidas[b].cantidadF,
                precioE: entradassalidas[b].precio,
                cantidadTotal: entradassalidas[b].cantidadF,
                precioTotal: entradassalidas[b].precio,
                precioUnitario: entradassalidas[b].precioUnitario,
                nameMaterial: entradassalidas[b].nameMaterial,
                nameSubMaterial: entradassalidas[b].nameSubMaterial,
                codMaterial: entradassalidas[b].codMaterial,
                codSubMaterial: entradassalidas[b].codSubMaterial,
                unidadMedida: entradassalidas[b].unidadMedida,
                numFactura: entradassalidas[b].numFactura,
                deDonde: entradassalidas[b].deDonde,
              })
            } else {
              // const ultimoDato = await KARDEX.find({ codSubMaterial: entradassalidas[b].codSubMaterial }).sort({ $natural: -1 }).limit(1)
              const precio1 = parseFloat(entradassalidas[b - 1].precio)
              const precio2 = parseFloat(entradassalidas[b].precio)
              var precioUnitario = 0
              if (entradassalidas[b].typeRegister === 'entrada') {
                cantidadTotal = cantidadTotal + parseFloat(entradassalidas[b].cantidadF)
                precioTotal = precioTotal + parseFloat(entradassalidas[b].precio)
                if (entradassalidas[b - 1].typeRegister === 'entrada') {
                  // precioUnitario = (precio1 + precio2) / cantidadTotal
                  precioUnitario = precioTotal / cantidadTotal
                } else {
                  // precioUnitario = (precioTotal + precio2) / cantidadTotal
                  precioUnitario = precioTotal / cantidadTotal
                }
                array.push({
                  idAlmacen: entradassalidas[b].idAlmacen,
                  typeRegister: entradassalidas[b].typeRegister,
                  registerDate: entradassalidas[b].registerDate,
                  notaRemision: entradassalidas[b].numeroIngreso,
                  procedenciaDestino: entradassalidas[b].procedenciaDestino,
                  cantidadE: entradassalidas[b].cantidadF,
                  precioE: entradassalidas[b].precio,
                  cantidadTotal: cantidadTotal,
                  precioTotal: precioTotal.toFixed(4),
                  precioUnitario: precioUnitario.toFixed(4),
                  nameMaterial: entradassalidas[b].nameMaterial,
                  nameSubMaterial: entradassalidas[b].nameSubMaterial,
                  codMaterial: entradassalidas[b].codMaterial,
                  codSubMaterial: entradassalidas[b].codSubMaterial,
                  unidadMedida: entradassalidas[b].unidadMedida,
                  numFactura: entradassalidas[b].numFactura,
                  deDonde: entradassalidas[b].deDonde,
                })
              } else {
                cantidadTotal = cantidadTotal - parseFloat(entradassalidas[b].cantidadS)
                precioTotal = precioTotal - parseFloat(entradassalidas[b].precioS)
                precioUnitario = parseFloat(entradassalidas[b].precioUnitario)
                var valorSalida = parseFloat(entradassalidas[b].cantidadS) * precioUnitario
                // if (entradassalidas.length === 0) {
                //   precioTotal = precio1 - valorSalida;
                // } else {
                //   precioTotal = precioTotal - parseFloat(entradassalidas[b].precioS)
                // }
                if (cantidadTotal === 0) {
                  precioUnitario = 0
                }
                array.push({
                  idAlmacen: entradassalidas[b].idAlmacen,
                  typeRegister: entradassalidas[b].typeRegister,
                  registerDate: entradassalidas[b].registerDate,
                  notaRemision: entradassalidas[b].numVale,
                  procedenciaDestino: entradassalidas[b].procedenciaDestino,
                  cantidadS: entradassalidas[b].cantidadS,
                  precioS: entradassalidas[b].precioS,
                  cantidadTotal: cantidadTotal,
                  precioTotal: precioTotal.toFixed(4),
                  precioUnitario: precioUnitario.toFixed(4),
                  nameMaterial: entradassalidas[b].nameMaterial,
                  nameSubMaterial: entradassalidas[b].nameSubMaterial,
                  codMaterial: entradassalidas[b].codMaterial,
                  codSubMaterial: entradassalidas[b].codSubMaterial,
                  unidadMedida: entradassalidas[b].unidadMedida,
                })
              }
            }
          }
        }
      }
    }
    // console.log(array)
    for (var i = 0; i < array.length; i++) {
      const register = new KARDEX(array[i])
      await register.save()
    }
    return JSON.stringify('kardex registrado completamente')
  } catch (error) {
    console.log(error)
  }
})

//--------------KARDEX VALORADO----------------
ipcMain.handle('get-kardex-valorado', async (e, args) => {
  const params = args
  try {
    const kardex = await KARDEX.find({ codSubMaterial: params }).sort({ _id: 1 })
    return JSON.stringify(kardex)
  } catch (error) {
    console.log(error)
  }
})


//-----------ID ALMACEN---------------------
ipcMain.handle('id-almacen', async (e, args) => {
  try {
    const almacen = await ENTRADASSALIDAS.find({})
    const cont = almacen.length
    for (var i = 0; i < cont; i++) {
      await ENTRADASSALIDAS.updateOne({ _id: almacen[i]._id }, { idAlmacen: uuidv4() })
    }
    return JSON.stringify('id almacen actualizado')
  } catch (error) {
    console.log(error)
  }
})

//-----------PERNOS-----------------------------------
ipcMain.handle('pernos', async (e, args) => {
  try {
    const pernos = await SUBMATERIAL.find({ codMaterial: '16-00X' })
    for (var i = 0; i < pernos.length; i++) {
      const result = await ENTRADASSALIDAS.find({ codSubMaterial: pernos[i].codSubMaterial })
      for (var j = 0; j < result.length; j++) {
        await ENTRADASSALIDAS.updateOne({ _id: result[j]._id }, { nameSubMaterial: pernos[i].nameSubMaterial })
      }
    }
    return JSON.stringify('pernos actualizados')
  } catch (error) {
    console.log(error)
  }
})


//--------------------PRECION UNITARIO-------------------
ipcMain.handle('precio-unitario', async (a, atgs) => {
  try {
    const result = await KARDEX.find({})
    const result2 = await ENTRADASSALIDAS.find({})
    const cont = result.length
    for (var i = 0; i < cont; i++) {
      for (var j = 0; j < result2.length; j++) {
        if (result[i].idAlmacen == result2[j].idAlmacen) {
          await ENTRADASSALIDAS.updateOne({ idAlmacen: result2[j].idAlmacen }, { precioUnitario: result[i].precioUnitario })

        }
      }
    }
    return JSON.stringify('perico unitario actualizado')
  } catch (error) {
    console.log(error)
  }
})


//--------------------------
// const result = await MATERIAL.find().sort({ codMaterial: 1 })
//   const contador = result.length

//   var array = []
//   for (var i = 0; i < contador; i++) {
//     var sum = 0;
//     const codMaterial = result[i].codMaterial
//     const subMaterial = await SUBMATERIAL.find({ codMaterial: result[i].codMaterial}).sort({ registerDate: 1 })
//     for(var j=0;j<subMaterial.length;j++){
//       const ultimo = await KARDEX.find({ codSubMaterial: subMaterial[j].codSubMaterial }).sort({ $natural: -1 }).limit(1);
//       if(ultimo.length>0){
//         sum=sum+ parseFloat(ultimo[0].precioTotal)
//       }
//     }
//     var otro = sum;
//     sum = new Intl.NumberFormat('es-BO').format(sum)
//     if (sum <= 0) {
//       sum = 0
//     }
//     array.push({
//       codMaterial: codMaterial,
//       saldoTotal: sum,
//       otroSaldo: otro,
//     })
//   }