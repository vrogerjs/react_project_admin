import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { db } from '../../db';
import {
  Button, Checkbox, Fab, styled, Table, TableCell, TextField, TablePagination,
  TableHead, TableBody, TableRow, TableContainer, Toolbar, Grid, CardContent, Card
} from '@mui/material';
import { Autorenew, PersonSearch, PictureAsPdf, TaskAlt } from '@mui/icons-material';
import { http, useResize, useFormState } from 'gra-react-utils';
import { tableCellClasses } from '@mui/material/TableCell';
import { useDispatch, useSelector } from "react-redux";
import {
  useNavigate
} from "react-router-dom";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    textAlign: 'center',
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const List = () => {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [state, setState] = useState({ page: 0, rowsPerPage: 50 });

  const [result, setResult] = useState({ size: 0, data: [] });

  const [selected, setSelected] = React.useState([]);

  const isSelected = (code) => selected.indexOf(code) !== -1;

  const networkStatus = useSelector((state) => state.networkStatus);

  const pad = (num, places) => String(num).padStart(places, '0')

  const onChangeAllRow = (event) => {
    if (event.target.checked) {
      const newSelected = result.data.map((row) => toID(row));
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const onClickRow = (event, code) => {
    const selectedIndex = selected.indexOf(code);

    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, code);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const emptyRows = result.data && result.data.length;

  const onPageChange = (
    event, page
  ) => {
    setState({ ...state, page: page });
  };

  const onRowsPerPageChange = (
    event
  ) => {
    setState({ ...state, rowsPerPage: event.target.value });
  };

  const onClickRefresh = () => {
    setSelected([]);
    fetchData(state.page);
  }

  const fetchData = async (page) => {
    var data = { data: [] };
    if (networkStatus.connected) {
      const result = await http.get(process.env.REACT_APP_PATH + '/api/project/' + page + '/' + state.rowsPerPage);
      data.size = result.size;
      data.data = data.data.concat(result.content);
    }
    setResult(data);
  };

  const { height, width } = useResize(React);

  useEffect(() => {
    const header = document.querySelector('.MuiToolbar-root');
    const tableContainer = document.querySelector('.MuiTableContainer-root');
    const nav = document.querySelector('nav');
    const toolbarTable = document.querySelector('.Toolbar-table');
    const tablePagination = document.querySelector('.MuiTablePagination-root');

    if (tableContainer) {
      tableContainer.style.width = (width - nav.offsetWidth) + 'px';
      tableContainer.style.height = (height - header.offsetHeight
        - toolbarTable.offsetHeight - tablePagination.offsetHeight) + 'px';
    }
  }, [height, width]);

  useEffect(() => {
    dispatch({ type: 'title', title: 'Gestión de Desaparecidos' });
    fetchData(state.page)
  }, [state.page, state.rowsPerPage]);

  const [o, { defaultProps }] = useFormState(useState, {}, {});

  const createOnClick = () => {
    navigate('/desaparecido/create');
  };

  const editOnClick = () => {
    navigate('/project/' + selected[0] + '/edit');
  }

  const verAlertaOnClick = () => {
    navigate('/desaparecido/alerta/' + selected[0]);
  }

  const onClickEncontrar = () => {
    dispatch({
      type: "confirm", msg: 'Se encontro a la persona seleccionada?', cb: (e) => {
        if (e) {
          http.get(process.env.REACT_APP_PATH + '/desaparecido/change/' + selected[0] + '?estado=1').then(e => {
            navigate('/desaparecido');
            dispatch({ type: "snack", msg: 'Persona encontrada.!' });
          });
        }
      }
    });
  };


  const toID = (row) => {
    return row._id && row._id.$oid ? row._id.$oid : row.id;
  }
  return (
    <>
      <Card>
        <CardContent sx={{ padding: '0px' }}>
          <Toolbar className="Toolbar-table" direction="row" >
            <Grid container spacing={2} sx={{ marginY: '1em !important' }}>
              <Grid item xs={12} sm={12} md={3}>
                <Button sx={{ width: '100%', fontWeight: 'bold' }} startIcon={<TaskAlt />} onClick={createOnClick} variant="contained" color="primary">Registrar</Button>
              </Grid>
              <Grid item xs={12} sm={12} md={3}>
                <Button sx={{ width: '100%', fontWeight: 'bold' }} disabled={!selected.length} startIcon={<EditIcon />} onClick={editOnClick} variant="contained" color="primary">Editar</Button>
              </Grid>
              <Grid item xs={12} sm={12} md={3}>
                <Button sx={{ width: '100%', fontWeight: 'bold' }} disabled={!selected.length} startIcon={<PictureAsPdf />} onClick={verAlertaOnClick} variant="contained" color="primary">Ver Alerta</Button>
              </Grid>
              <Grid item xs={12} sm={12} md={3}>
                <Button sx={{ width: '100%', fontWeight: 'bold' }} disabled={!selected.length} onClick={onClickEncontrar} startIcon={<PersonSearch />} variant="contained" color="primary">Cambiar estado</Button>
              </Grid>
            </Grid>
          </Toolbar>
          <TableContainer sx={{ maxWidth: '100%', mx: 'auto', maxHeight: '540px' }}>
            <Table stickyHeader aria-label="sticky table" className='mt-5'>
              <TableHead>
                <TableRow>
                  <StyledTableCell padding="checkbox" className='bg-gore border-table'>
                    <Checkbox
                      style={{ color: 'white' }}
                      indeterminate={selected.length > 0 && selected.length < result.data.length}
                      checked={result && result.data.length > 0 && selected.length === result.data.length}
                      onChange={onChangeAllRow}
                      inputProps={{
                        'aria-label': 'select all desserts',
                      }}
                    />
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Etapa del Proyecto
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>CUI
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Denominación del Proyecto
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Plazo de Ejecución
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Saldo Presupuestal
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>PIA
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Monto de Inversion
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Contratista Ejecutor
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Monto del Contrato
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Observación del Infobras
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Observación Local
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Fecha de Inicio Contractual
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Fecha de Culminación Contractual
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Fecha Reprogramada de Culminación
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Avance Físico
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Contratista Supervisor
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Coordinador
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Tipo Cuaderno
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Por presupuestar
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Certificado
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Fecha Suspensión
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Residente
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Nº Resolución
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Fecha Resolución
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Nº Contrato
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Presidente
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Primer Miembro
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Asesor Técnico
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Saldo Presupuestal
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Contrato
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Inicio Liquidación
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Fin Liquidación
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Estado Liquidación
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(result && result.data && result.data.length ? result.data : [])
                  .map((row, index) => {
                    const isItemSelected = isSelected(toID(row));
                    return (
                      <StyledTableRow
                        style={{ backgroundColor: (1) ? '' : (index % 2 === 0 ? '#f1f19c' : '#ffffbb') }}
                        hover
                        onClick={(event) => onClickRow(event, toID(row))}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={index + ' ' + toID(row)}
                        selected={isItemSelected}
                      >
                        <TableCell padding="checkbox" className='border-table'>
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                          />
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.etapaProyecto}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.cui}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.denominacionProyecto}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.plazoEjecucion}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.saldoPresupuestal}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.pia}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.montoInversion}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.contratistaEjecutor}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.montoContratoContratista}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.observacionInfo}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.observacionLocal}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.fechaInicioContractual}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.fechaCulminacionContractual}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.fechaReprogramadaCulminacion}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.avanceFisico}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.contratistaSupervisor}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.coordinador}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.tipoCuaderno}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.presupuestar}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.certificado}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.fechaSuspension}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.residente}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.nroResolucion}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.fechaResolución}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.nroContrato}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.presidente}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.primerMiembro}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.asesorTecnico}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.saldoPresupuestal}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.contrato}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.inicioLiquidacion}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.finLiquidacion}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.estadoLiquidacion}
                        </TableCell>
                      </StyledTableRow >
                    );
                  })}
                {(!emptyRows) && (
                  <TableRow style={{ height: 53 }}>
                    <TableCell colSpan={7} >
                      No data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            component="div"
            count={result.size}
            rowsPerPage={state.rowsPerPage}
            page={state.page}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </CardContent>
      </Card>
    </>
  );

};

export default List;