import React, { useState, useEffect, createRef } from 'react';
import { useFormState, useResize, http } from 'gra-react-utils';
import { db } from '../../db';
import {
  Send as SendIcon,
  Add as AddIcon,
  Keyboard
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Box, Button, Card, CardContent, Fab, MenuItem, Stack, InputAdornment, TextField, Grid, Typography
} from '@mui/material';
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Select from '@mui/material/Select';

import { retrieve } from '../../db';

import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import Divider from '@mui/material/Divider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { makeStyles } from '@material-ui/core/styles';
import MapWrapper from '../../components/MapWrapper'

export const Form = () => {

  const dispatch = useDispatch();

  const networkStatus = useSelector((state) => state.networkStatus);

  const { pid } = useParams();

  const formRef = createRef();

  const navigate = useNavigate();

  const [dependencias, setDependencias] = useState([]);

  const [departamentos, setDepartamentos] = useState([]);

  const [provincias, setProvincias] = useState([]);

  const [distritos, setDistritos] = useState([]);

  const [state, setState] = useState({ page: 0, rowsPerPage: 50 });

  const [o, { defaultProps, handleChange, bindEvents, validate, set }] = useFormState(useState, {
    departamento: '00',
    latitud: '',
    longitud: ''
  }, {});

  const [d] = useFormState(useState, {

  }, {});

  let days = { 2: 'Lunes', 3: 'Martes', 4: 'Miercoles', 5: 'Jueves', 6: 'Viernes' };

  useEffect(() => {
    dispatch({ type: 'title', title: (pid ? 'Actualizar' : 'Registrar') + ' Dependencia' });
    [].forEach(async (e) => {
      e[1](await db[e[0]].toArray());
    });

    // retrieve('region', setDepartamentos);
    // retrieve('province', setProvincias);
    // retrieve('district', setDistritos);

  }, []);

  const pad = (num, places) => String(num).padStart(places, '0')

  useEffect(() => {
    if (pid) {
      if (networkStatus.connected) {
        http.get(process.env.REACT_APP_PATH + '/api/project/' + pid).then((result) => {

          result.idProject = result.id;

          set(result);
        });
      }
    }
  }, [pid]);

  const { width, height } = useResize(React);

  useEffect(() => {
    if (formRef.current) {
      const header = document.querySelector('.MuiToolbar-root');
      const [body, toolBar] = formRef.current.children;
      const nav = document.querySelector('nav');
      body.style.height = (height - header.offsetHeight - toolBar.offsetHeight) + 'px';
      toolBar.style.width = (width - nav.offsetWidth) + 'px';
    }
  }, [width, height]);

  useEffect(() => {
    dispatch({ type: 'title', title: 'Gestión de Persona Desaparecida.' });
  }, []);

  const onClickCancel = () => {
    navigate(-1);
  }

  const onClickAdd = async () => {
    navigate('/desaparecido/create', { replace: true });
  }

  const onClickSave = async () => {
    var o2 = { ...o };
    http.post(process.env.REACT_APP_PATH + '/api/project', o2).then(async (result) => {
      if (!o2._id) {
        if (result.id) {
          // navigate('/desaparecido/' + result.id + '/edit', { replace: true });
          dispatch({ type: "snack", msg: 'Registro grabado!' });
          navigate('/project', { replace: true });
        }
        else {
          navigate(-1);
        }
      }
    });


  };

  const onSubmit = data => console.log(data);

  const theme = createTheme({
    components: {
      // Name of the component ⚛️
      MuiInput: {
        defaultProps: {
          required: true
        }
      },
    },
  });

  function onChangeFechaCulminacionContractual(v) {
    o.fechaCulminacionContractual = v;
    set(o => ({ ...o, fechaCulminacionContractual: v }));
  }

  function onChangeFechaFinLiquidacion(v) {
    o.fechaFinLiquidacion = v;
    set(o => ({ ...o, fechaFinLiquidacion: v }));
  }

  function onChangeFechaInicioContractual(v) {
    set(o => ({ ...o, fechaInicioContractual: v }), () => {
      o.fechaInicioContractual = v;
    });
  }

  function onChangeFechaInicioLiquidacion(v) {
    set(o => ({ ...o, fechaInicioLiquidacion: v }), () => {
      o.fechaInicioLiquidacion = v;
    });
  }

  function onChangeFechaReprogramacionContractual(v) {
    set(o => ({ ...o, fechaReprogramacionContractual: v }), () => {
      o.fechaReprogramacionContractual = v;
    });
  }

  function onChangeFechaResolucion(v) {
    set(o => ({ ...o, fechaResolucion: v }), () => {
      o.fechaResolucion = v;
    });
  }

  function onChangeFechaSuspension(v) {
    set(o => ({ ...o, fechaSuspension: v }), () => {
      o.fechaSuspension = v;
    });
  }

  function disabled() {
    if (o.varTemp === 1) {
      return true;
    } else {
      return false;
    };
  }

  const onKeyUpNroDocumento = async () => {
    if (o.dni.length === 8) {
      http.get(process.env.REACT_APP_PATH + '/persona/search/' + o.dni).then(async (resultP) => {
        if (resultP.length > 0) {

          var idPersona = resultP[0].id;
          var nombres = resultP[0].nombres;
          var apePaterno = resultP[0].apePaterno;
          var apeMaterno = resultP[0].apeMaterno;
          var direccion = resultP[0].direccion;
          var fechaNacimiento = resultP[0].fechaNacimiento;
          var edad = resultP[0].edad;
          var sexo = resultP[0].sexo;
          var estadoCivil = resultP[0].estadoCivil;
          var foto = resultP[0].foto;

          console.log('idPersona > 0', idPersona);

          set(o => ({ ...o, nombres: nombres, apePaterno: apePaterno, apeMaterno: apeMaterno, direccion: direccion, idPersona: idPersona, fechaNacimiento: fechaNacimiento, edad: edad, sexo: sexo, estadoCivil: estadoCivil, foto: foto, varTemp: 1 }), () => {
            o.idPersona = idPersona;
            o.nombres = nombres;
            o.apePaterno = apePaterno;
            o.apeMaterno = apeMaterno;
            o.direccion = direccion;
            o.fechaNacimiento = fechaNacimiento;
            o.edad = edad;
            o.sexo = sexo;
            o.estadoCivil = estadoCivil;
            o.foto = foto;
            o.varTemp = 1;
          });
        } else {
          http.get('http://web.regionancash.gob.pe/api/reniec/Consultar?nuDniConsulta=' + o.dni + '&out=json', (h) => {
            return { "Content-Type": "*/*" };
          }).then(async (result) => {
            if (result.consultarResponse.return.coResultado === '0000') {
              var datos = result.consultarResponse.return;
              var nombres = datos.datosPersona.prenombres;
              var apePaterno = datos.datosPersona.apPrimer;
              var apeMaterno = datos.datosPersona.apSegundo;
              var direccion = datos.datosPersona.direccion;
              var foto = datos.datosPersona.foto;

              set(o => ({ ...o, nombres: nombres, apePaterno: apePaterno, apeMaterno: apeMaterno, direccion: direccion, foto: foto, idPersona: '', varTemp: 2 }), () => {
                o.nombres = nombres;
                o.apePaterno = apePaterno;
                o.apeMaterno = apeMaterno;
                o.direccion = direccion;
                o.foto = foto;
                o.idPersona = '';
                o.varTemp = 2;
              });
              console.log('idPersona no lo encuentra', idPersona);

            } else {
              set(o => ({ ...o, nombres: '', apePaterno: '', apeMaterno: '', direccion: '', fechaNacimiento: '', edad: '', sexo: 'Masculino', estadoCivil: 'Soltero(a)' }), () => {
                o.nombres = '';
                o.apePaterno = '';
                o.apeMaterno = '';
                o.direccion = '';
                o.fechaNacimiento = '';
                o.edad = '';
                o.sexo = 'Masculino';
                o.estadoCivil = 'Soltero(a)';
              });
            }
          });
        }
      });
    } else {
      set(o => ({ ...o, nombres: '', apePaterno: '', apeMaterno: '', direccion: '', fechaNacimiento: '', edad: '', sexo: 'Masculino', estadoCivil: 'Soltero(a)', foto: '' }), () => {
        o.nombres = '';
        o.apePaterno = '';
        o.apeMaterno = '';
        o.direccion = '';
        o.fechaNacimiento = '';
        o.edad = '';
        o.sexo = 'Masculino';
        o.estadoCivil = 'Soltero(a)';
        o.foto = '';
      });
    }
  }

  function getActions() {
    return <>
      <Button variant="contained" onClick={onClickCancel} color="error">
        Cancelar
      </Button>
      <Button disabled={o.old && !o.confirm} variant="contained" onClick={onClickSave} color="success" endIcon={<SendIcon />}>
        Grabar
      </Button>
    </>
  }

  function getContent() {

    return <LocalizationProvider dateAdapter={AdapterDayjs}><ThemeProvider theme={theme}>
      <form ref={formRef} onSubmit={onSubmit} style={{ textAlign: 'left' }}>
        <Box style={{ overflow: 'auto' }}>
          <Card className='mt-1 bs-black'>
            <CardContent>
              <Typography gutterBottom variant="h5" className='text-center fw-bold color-gore'>
                DATOS DEL PROYECTO
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    // disabled={disabled()}
                    select
                    margin="normal"
                    required
                    fullWidth
                    id="standard-name"
                    label="Seleccione la Etapa del Proyecto: "
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("etapaProyecto", {
                      // onChange: onChangeTipoDocumento
                    })}
                  >
                    {['Por Iniciar', 'En ejecución', 'Suspendidas - Paralizadas', 'Ejecución por ARRCC', 'En Recepción', 'En Liquidación', 'Contrato Resuelto'].map((item, i) => (
                      <MenuItem key={'houseAccess_' + i} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {o.etapaProyecto == 'Por Iniciar' || o.etapaProyecto == 'En ejecución' || o.etapaProyecto == 'Suspendidas - Paralizadas' || o.etapaProyecto == 'Ejecución por ARRCC' || o.etapaProyecto == 'En Recepción' || o.etapaProyecto == 'En Liquidación' ?
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        size="medium"
                        id="standard-name"
                        label="CUI: "
                        placeholder="CUI"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...defaultProps("cui")}
                      />
                    </Grid>
                  </>
                  : null}

                {o.etapaProyecto == 'Por Iniciar' || o.etapaProyecto == 'En ejecución' || o.etapaProyecto == 'Suspendidas - Paralizadas' || o.etapaProyecto == 'Ejecución por ARRCC' || o.etapaProyecto == 'En Recepción' || o.etapaProyecto == 'En Liquidación' ?
                  <>
                    <Grid item xs={12} md={12} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        multiline
                        size="medium"
                        rows={4}
                        id="standard-name"
                        label="Ingrese la Denominación del Proyecto: "
                        placeholder="Denominación del Proyecto"
                        {...defaultProps("denominacionProyecto")}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'Por Iniciar' || o.etapaProyecto == 'En ejecución' || o.etapaProyecto == 'Suspendidas - Paralizadas' || o.etapaProyecto == 'Ejecución por ARRCC' ?
                  <>
                    <Grid item xs={12} md={3} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        size="medium"
                        id="standard-name"
                        label="Ingrese el Plazo de Ejecución: "
                        placeholder="Plazo de Ejecución"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...defaultProps("plazoEjecucion")}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'Por Iniciar' || o.etapaProyecto == 'En ejecución' || o.etapaProyecto == 'Suspendidas - Paralizadas' || o.etapaProyecto == 'Ejecución por ARRCC' || o.etapaProyecto == 'En Recepción' ?
                  <>
                    <Grid item xs={12} md={3} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        size="medium"
                        id="standard-name"
                        label="Ingrese el Saldo Presupuestal: "
                        placeholder="Saldo Presupuestal"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...defaultProps("saldoPresupuestal")}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'Por Iniciar' || o.etapaProyecto == 'En ejecución' || o.etapaProyecto == 'Suspendidas - Paralizadas' || o.etapaProyecto == 'Ejecución por ARRCC' ?
                  <>
                    <Grid item xs={12} md={3} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        size="medium"
                        id="standard-name"
                        label="PIA: "
                        placeholder="PIA"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...defaultProps("pia")}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'Por Iniciar' || o.etapaProyecto == 'Suspendidas - Paralizadas' || o.etapaProyecto == 'Ejecución por ARRCC' ?
                  <>
                    <Grid item xs={12} md={3} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        size="medium"
                        id="standard-name"
                        label="Ingrese el Monto de Inversión: "
                        placeholder="Monto de Inversión"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...defaultProps("montoInversion")}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'Por Iniciar' || o.etapaProyecto == 'En ejecución' || o.etapaProyecto == 'Suspendidas - Paralizadas' || o.etapaProyecto == 'Ejecución por ARRCC' || o.etapaProyecto == 'En Recepción' ?
                  <>
                    <Grid item xs={12} md={12} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        multiline
                        size="medium"
                        rows={4}
                        id="standard-name"
                        label="Ingrese el Nombre del Contratista Ejecutor: "
                        placeholder="Contratista Ejecutor"
                        {...defaultProps("contratistaEjecutor")}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'Por Iniciar' || o.etapaProyecto == 'En ejecución' || o.etapaProyecto == 'Suspendidas - Paralizadas' || o.etapaProyecto == 'Ejecución por ARRCC' || o.etapaProyecto == 'En Recepción' ?
                  <>
                    <Grid item xs={12} md={6} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        size="medium"
                        id="standard-name"
                        label="Ingrese el Monto de Contrato del Contratista: "
                        placeholder="Monto de Contrato del Contratista"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...defaultProps("montoContratoContratista")}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'Por Iniciar' || o.etapaProyecto == 'En ejecución' || o.etapaProyecto == 'Suspendidas - Paralizadas' || o.etapaProyecto == 'Ejecución por ARRCC' || o.etapaProyecto == 'En Recepción' ?
                  <>
                    <Grid item xs={12} md={12} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        multiline
                        size="medium"
                        rows={4}
                        id="standard-name"
                        label="Ingrese la Observación Local: "
                        placeholder="Observación Local"
                        {...defaultProps("observacionLocal")}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En ejecución' || o.etapaProyecto == 'Suspendidas - Paralizadas' || o.etapaProyecto == 'Ejecución por ARRCC' ?
                  <>
                    <Grid item xs={12} md={3} sx={{ paddingTop: '0px !important' }}>
                      <DesktopDatePicker
                        disabled={disabled()}
                        label="Ingrese la Fecha de Inicio Contractual:"
                        inputFormat="DD/MM/YYYY"
                        value={o.fechaInicioContractual || ''}
                        onChange={onChangeFechaInicioContractual}
                        renderInput={(params) =>
                          <TextField
                            type={'number'}
                            sx={{ fontWeight: 'bold' }}
                            margin="normal"
                            required
                            fullWidth
                            id="standard-name"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Keyboard />
                                </InputAdornment>
                              ),
                            }}
                            {...params}
                          />}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En ejecución' || o.etapaProyecto == 'Suspendidas - Paralizadas' || o.etapaProyecto == 'Ejecución por ARRCC' ?
                  <>
                    <Grid item xs={12} md={3} sx={{ paddingTop: '0px !important' }}>
                      <DesktopDatePicker
                        disabled={disabled()}
                        label="Ingrese la Fecha de Culminación Contractual:"
                        inputFormat="DD/MM/YYYY"
                        value={o.fechaCulminacionContractual || ''}
                        onChange={onChangeFechaCulminacionContractual}
                        renderInput={(params) =>
                          <TextField
                            type={'number'}
                            sx={{ fontWeight: 'bold' }}
                            margin="normal"
                            required
                            fullWidth
                            id="standard-name"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Keyboard />
                                </InputAdornment>
                              ),
                            }}
                            {...params}
                          />}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En ejecución' ?
                  <>
                    <Grid item xs={12} md={3} sx={{ paddingTop: '0px !important' }}>
                      <DesktopDatePicker
                        disabled={disabled()}
                        label="Ingrese la Fecha de Reprogramación Contractual:"
                        inputFormat="DD/MM/YYYY"
                        value={o.fechaReprogramacionContractual || ''}
                        onChange={onChangeFechaReprogramacionContractual}
                        renderInput={(params) =>
                          <TextField
                            type={'number'}
                            sx={{ fontWeight: 'bold' }}
                            margin="normal"
                            required
                            fullWidth
                            id="standard-name"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Keyboard />
                                </InputAdornment>
                              ),
                            }}
                            {...params}
                          />}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En ejecución' || o.etapaProyecto == 'Suspendidas - Paralizadas' || o.etapaProyecto == 'Ejecución por ARRCC' ?
                  <>
                    <Grid item xs={12} md={3} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        size="medium"
                        id="standard-name"
                        label="Ingrese el Avance Físico: "
                        placeholder="Avance Físico"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...defaultProps("avanceFisico")}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En ejecución' || o.etapaProyecto == 'Suspendidas - Paralizadas' || o.etapaProyecto == 'Ejecución por ARRCC' ?
                  <>
                    <Grid item xs={12} md={12} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        size="medium"
                        id="standard-name"
                        label="Ingrese los datos del Residente: "
                        placeholder="Residente"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...defaultProps("residente")}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En ejecución' || o.etapaProyecto == 'Suspendidas - Paralizadas' || o.etapaProyecto == 'Ejecución por ARRCC' ?
                  <>
                    <Grid item xs={12} md={12} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        multiline
                        size="medium"
                        rows={4}
                        id="standard-name"
                        label="Ingrese al Contratista Supervisor: "
                        placeholder="Contratista Supervisor"
                        {...defaultProps("contratistaSupervisor")}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En ejecución' || o.etapaProyecto == 'Suspendidas - Paralizadas' || o.etapaProyecto == 'Ejecución por ARRCC' ?
                  <>
                    <Grid item xs={12} md={3} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        size="medium"
                        id="standard-name"
                        label="Ingrese el Monto de Contrato Supervisor: "
                        placeholder="Monto de Contrato Supervisor"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...defaultProps("montoContratistaSupervisor")}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En ejecución' || o.etapaProyecto == 'Suspendidas - Paralizadas' || o.etapaProyecto == 'Ejecución por ARRCC' ?
                  <>
                    <Grid item xs={12} md={12} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        size="medium"
                        id="standard-name"
                        label="Ingrese los datos del Coordinador: "
                        placeholder="Coordinador"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...defaultProps("coordinador")}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En ejecución' || o.etapaProyecto == 'Suspendidas - Paralizadas' || o.etapaProyecto == 'Ejecución por ARRCC' ?
                  <>
                    <Grid item xs={12} md={3} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        select
                        margin="normal"
                        required
                        fullWidth
                        id="standard-name"
                        label="Seleccione el Tipo de Cuaderno: "
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...defaultProps("tipoCuaderno", {
                          // onChange: onChangeTipoDocumento
                        })}
                      >
                        {['Fisico', 'Digital'].map((item, i) => (
                          <MenuItem key={'houseAccess_' + i} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En ejecución' ?
                  <>
                    <Grid item xs={12} md={3} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        size="medium"
                        id="standard-name"
                        label="Ingrese el Monto por Presupuestar: "
                        placeholder="Por Presupuestar"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...defaultProps("presupuestar")}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En ejecución' || o.etapaProyecto == 'Ejecución por ARRCC' ?
                  <>
                    <Grid item xs={12} md={3} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        select
                        margin="normal"
                        required
                        fullWidth
                        id="standard-name"
                        label="Seleccione si está Certificado: "
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...defaultProps("certificado", {
                          // onChange: onChangeTipoDocumento
                        })}
                      >
                        {['Si', 'No'].map((item, i) => (
                          <MenuItem key={'houseAccess_' + i} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'Suspendidas - Paralizadas' ?
                  <>
                    <Grid item xs={12} md={3} sx={{ paddingTop: '0px !important' }}>
                      <DesktopDatePicker
                        disabled={disabled()}
                        label="Ingrese la Fecha de Suspensión:"
                        inputFormat="DD/MM/YYYY"
                        value={o.fechaSuspension || ''}
                        onChange={onChangeFechaSuspension}
                        renderInput={(params) =>
                          <TextField
                            type={'number'}
                            sx={{ fontWeight: 'bold' }}
                            margin="normal"
                            required
                            fullWidth
                            id="standard-name"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Keyboard />
                                </InputAdornment>
                              ),
                            }}
                            {...params}
                          />}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En Recepción' ?
                  <>
                    <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        size="medium"
                        id="standard-name"
                        label="Ingrese el Nº de Resolución: "
                        placeholder="Nº de Resolución"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...defaultProps("nroResolucion")}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En Recepción' ?
                  <>
                    <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                      <DesktopDatePicker
                        disabled={disabled()}
                        label="Ingrese la Fecha de Resolución:"
                        inputFormat="DD/MM/YYYY"
                        value={o.fechaResolucion || ''}
                        onChange={onChangeFechaResolucion}
                        renderInput={(params) =>
                          <TextField
                            type={'number'}
                            sx={{ fontWeight: 'bold' }}
                            margin="normal"
                            required
                            fullWidth
                            id="standard-name"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Keyboard />
                                </InputAdornment>
                              ),
                            }}
                            {...params}
                          />}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En Recepción' ?
                  <>
                    <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        size="medium"
                        id="standard-name"
                        label="Ingrese el Nº de Contrato: "
                        placeholder="Nº de Contrato"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...defaultProps("nroContrato")}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En Recepción' ?
                  <>
                    <Grid item xs={12} md={12} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        size="medium"
                        id="standard-name"
                        label="Ingrese los datos del Presidente: "
                        placeholder="Presidente"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...defaultProps("presidente")}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En Recepción' ?
                  <>
                    <Grid item xs={12} md={12} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        size="medium"
                        id="standard-name"
                        label="Ingrese los datos del Primer Miembro: "
                        placeholder="Primer Miembro"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...defaultProps("primerMiembro")}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En Recepción' ?
                  <>
                    <Grid item xs={12} md={12} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        size="medium"
                        id="standard-name"
                        label="Ingrese los datos del Asesor Técnico: "
                        placeholder="Asesor Técnico"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...defaultProps("asesorTecnico")}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En Liquidación' ?
                  <>
                    <Grid item xs={12} md={3} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        select
                        margin="normal"
                        required
                        fullWidth
                        id="standard-name"
                        label="Seleccione el Contrato: "
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...defaultProps("contrato", {
                          // onChange: onChangeTipoDocumento
                        })}
                      >
                        {['Obra', 'Supervision'].map((item, i) => (
                          <MenuItem key={'houseAccess_' + i} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En Liquidación' ?
                  <>
                    <Grid item xs={12} md={3} sx={{ paddingTop: '0px !important' }}>
                      <DesktopDatePicker
                        disabled={disabled()}
                        label="Ingrese la Fecha de Inicio de Liquidación:"
                        inputFormat="DD/MM/YYYY"
                        value={o.fechaInicioLiquidacion || ''}
                        onChange={onChangeFechaInicioLiquidacion}
                        renderInput={(params) =>
                          <TextField
                            type={'number'}
                            sx={{ fontWeight: 'bold' }}
                            margin="normal"
                            required
                            fullWidth
                            id="standard-name"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Keyboard />
                                </InputAdornment>
                              ),
                            }}
                            {...params}
                          />}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En Liquidación' ?
                  <>
                    <Grid item xs={12} md={3} sx={{ paddingTop: '0px !important' }}>
                      <DesktopDatePicker
                        disabled={disabled()}
                        label="Ingrese la Fecha Fin de Liquidación:"
                        inputFormat="DD/MM/YYYY"
                        value={o.fechaFinLiquidacion || ''}
                        onChange={onChangeFechaFinLiquidacion}
                        renderInput={(params) =>
                          <TextField
                            type={'number'}
                            sx={{ fontWeight: 'bold' }}
                            margin="normal"
                            required
                            fullWidth
                            id="standard-name"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Keyboard />
                                </InputAdornment>
                              ),
                            }}
                            {...params}
                          />}
                      />
                    </Grid>
                  </>
                  : null}


                {o.etapaProyecto == 'En Liquidación' ?
                  <>
                    <Grid item xs={12} md={3} sx={{ paddingTop: '0px !important' }}>
                      <TextField
                        select
                        margin="normal"
                        required
                        fullWidth
                        id="standard-name"
                        label="Seleccione el Estado: "
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...defaultProps("estado", {
                          // onChange: onChangeTipoDocumento
                        })}
                      >
                        {['Liquidacion', 'Otro'].map((item, i) => (
                          <MenuItem key={'houseAccess_' + i} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </>
                  : null}
              </Grid>

              {/* <Divider variant="middle" sx={{ marginY: '20px', marginX: '0px', border: '1px solid #0000001f' }} /> */}

            </CardContent>
          </Card>
        </Box>
        <Stack direction="row" justifyContent="center"
          style={{ padding: '10px', backgroundColor: '#0f62ac' }}
          alignItems="center" spacing={1}>
          {getActions()}
        </Stack>
      </form>
    </ThemeProvider></LocalizationProvider>
  }
  return <>{
    1 == 1 ? <Box style={{ textAlign: 'left' }}>{getContent()}</Box>
      : <Box
        sx={{ display: 'flex' }}>
      </Box>
  }
  </>;

}