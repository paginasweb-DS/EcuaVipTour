package com.ecuaviptour.modules.pagos.mapper;

import com.ecuaviptour.modules.viajes.mapper.ViajeMapper;

import com.ecuaviptour.modules.viajes.mapper.ViajeMapper;

import com.ecuaviptour.modules.pagos.dto.PagoDTO;
import com.ecuaviptour.modules.pagos.domain.Pago;
import org.springframework.stereotype.Component;

@Component
public class PagoMapper {

    private final ViajeMapper viajeMapper;

    public PagoMapper(ViajeMapper viajeMapper) {
        this.viajeMapper = viajeMapper;
    }

    public PagoDTO toDTO(Pago entity) {
        if (entity == null) {
            return null;
        }
        return new PagoDTO(
                entity.getId(),
                viajeMapper.toDTO(entity.getViaje()),
                entity.getComprobanteUrl(),
                entity.getMontoPagado(),
                entity.getFechaPago()
        );
    }

    public Pago toEntity(PagoDTO dto) {
        if (dto == null) {
            return null;
        }
        return new Pago(
                dto.getId(),
                viajeMapper.toEntity(dto.getViaje()),
                dto.getComprobanteUrl(),
                dto.getMontoPagado(),
                dto.getFechaPago()
        );
    }
}
