package com.ecuaviptour.soap;

import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.ws.config.annotation.EnableWs;
import org.springframework.ws.config.annotation.WsConfigurerAdapter;
import org.springframework.ws.server.EndpointInterceptor;
import org.springframework.ws.soap.server.endpoint.interceptor.PayloadValidatingInterceptor;
import org.springframework.ws.transport.http.MessageDispatcherServlet;
import org.springframework.ws.wsdl.wsdl11.DefaultWsdl11Definition;
import org.springframework.xml.xsd.SimpleXsdSchema;
import org.springframework.xml.xsd.XsdSchema;

import java.util.List;

@EnableWs
@Configuration
public class WebServiceConfig extends WsConfigurerAdapter {

    @Bean
    public ServletRegistrationBean<MessageDispatcherServlet> messageDispatcherServlet(ApplicationContext applicationContext) {
        MessageDispatcherServlet servlet = new MessageDispatcherServlet();
        servlet.setApplicationContext(applicationContext);
        servlet.setTransformWsdlLocations(true);
        return new ServletRegistrationBean<>(servlet, "/ws/*");
    }

    @Override
    public void addInterceptors(List<EndpointInterceptor> interceptors) {
        PayloadValidatingInterceptor validatingInterceptor = new PayloadValidatingInterceptor();
        validatingInterceptor.setValidateRequest(true);
        validatingInterceptor.setValidateResponse(false);
        validatingInterceptor.setSchemas(new Resource[]{
                new ClassPathResource("soap/xsd/auth.xsd"),
                new ClassPathResource("soap/xsd/viajes.xsd"),
                new ClassPathResource("soap/xsd/chat.xsd"),
                new ClassPathResource("soap/xsd/chofer.xsd"),
                new ClassPathResource("soap/xsd/pagos.xsd"),
                new ClassPathResource("soap/xsd/admin.xsd"),
                new ClassPathResource("soap/xsd/gastos.xsd")
        });
        try {
            validatingInterceptor.afterPropertiesSet();
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize SOAP payload validating interceptor", e);
        }
        interceptors.add(validatingInterceptor);
    }

    // 1. Auth WSDL
    @Bean(name = "auth")
    public DefaultWsdl11Definition authWsdl11Definition(XsdSchema authSchema) {
        DefaultWsdl11Definition wsdl11Definition = new DefaultWsdl11Definition();
        wsdl11Definition.setPortTypeName("AuthPort");
        wsdl11Definition.setLocationUri("/ws");
        wsdl11Definition.setTargetNamespace("http://ecuaviptour.com/soap/auth");
        wsdl11Definition.setSchema(authSchema);
        return wsdl11Definition;
    }

    @Bean
    public XsdSchema authSchema() {
        return new SimpleXsdSchema(new ClassPathResource("soap/xsd/auth.xsd"));
    }

    // 2. Viajes WSDL
    @Bean(name = "viajes")
    public DefaultWsdl11Definition viajesWsdl11Definition(XsdSchema viajesSchema) {
        DefaultWsdl11Definition wsdl11Definition = new DefaultWsdl11Definition();
        wsdl11Definition.setPortTypeName("ViajesPort");
        wsdl11Definition.setLocationUri("/ws");
        wsdl11Definition.setTargetNamespace("http://ecuaviptour.com/soap/viajes");
        wsdl11Definition.setSchema(viajesSchema);
        return wsdl11Definition;
    }

    @Bean
    public XsdSchema viajesSchema() {
        return new SimpleXsdSchema(new ClassPathResource("soap/xsd/viajes.xsd"));
    }

    // 3. Chat WSDL
    @Bean(name = "chat")
    public DefaultWsdl11Definition chatWsdl11Definition(XsdSchema chatSchema) {
        DefaultWsdl11Definition wsdl11Definition = new DefaultWsdl11Definition();
        wsdl11Definition.setPortTypeName("ChatPort");
        wsdl11Definition.setLocationUri("/ws");
        wsdl11Definition.setTargetNamespace("http://ecuaviptour.com/soap/chat");
        wsdl11Definition.setSchema(chatSchema);
        return wsdl11Definition;
    }

    @Bean
    public XsdSchema chatSchema() {
        return new SimpleXsdSchema(new ClassPathResource("soap/xsd/chat.xsd"));
    }

    // 4. Chofer WSDL
    @Bean(name = "chofer")
    public DefaultWsdl11Definition choferWsdl11Definition(XsdSchema choferSchema) {
        DefaultWsdl11Definition wsdl11Definition = new DefaultWsdl11Definition();
        wsdl11Definition.setPortTypeName("ChoferPort");
        wsdl11Definition.setLocationUri("/ws");
        wsdl11Definition.setTargetNamespace("http://ecuaviptour.com/soap/chofer");
        wsdl11Definition.setSchema(choferSchema);
        return wsdl11Definition;
    }

    @Bean
    public XsdSchema choferSchema() {
        return new SimpleXsdSchema(new ClassPathResource("soap/xsd/chofer.xsd"));
    }

    // 5. Pagos WSDL
    @Bean(name = "pagos")
    public DefaultWsdl11Definition pagosWsdl11Definition(XsdSchema pagosSchema) {
        DefaultWsdl11Definition wsdl11Definition = new DefaultWsdl11Definition();
        wsdl11Definition.setPortTypeName("PagosPort");
        wsdl11Definition.setLocationUri("/ws");
        wsdl11Definition.setTargetNamespace("http://ecuaviptour.com/soap/pagos");
        wsdl11Definition.setSchema(pagosSchema);
        return wsdl11Definition;
    }

    @Bean
    public XsdSchema pagosSchema() {
        return new SimpleXsdSchema(new ClassPathResource("soap/xsd/pagos.xsd"));
    }

    // 6. Admin WSDL
    @Bean(name = "admin")
    public DefaultWsdl11Definition adminWsdl11Definition(XsdSchema adminSchema) {
        DefaultWsdl11Definition wsdl11Definition = new DefaultWsdl11Definition();
        wsdl11Definition.setPortTypeName("AdminPort");
        wsdl11Definition.setLocationUri("/ws");
        wsdl11Definition.setTargetNamespace("http://ecuaviptour.com/soap/admin");
        wsdl11Definition.setSchema(adminSchema);
        return wsdl11Definition;
    }

    @Bean
    public XsdSchema adminSchema() {
        return new SimpleXsdSchema(new ClassPathResource("soap/xsd/admin.xsd"));
    }

    // 7. Gastos WSDL
    @Bean(name = "gastos")
    public DefaultWsdl11Definition gastosWsdl11Definition(XsdSchema gastosSchema) {
        DefaultWsdl11Definition wsdl11Definition = new DefaultWsdl11Definition();
        wsdl11Definition.setPortTypeName("GastosPort");
        wsdl11Definition.setLocationUri("/ws");
        wsdl11Definition.setTargetNamespace("http://ecuaviptour.com/soap/gastos");
        wsdl11Definition.setSchema(gastosSchema);
        return wsdl11Definition;
    }

    @Bean
    public XsdSchema gastosSchema() {
        return new SimpleXsdSchema(new ClassPathResource("soap/xsd/gastos.xsd"));
    }
}
